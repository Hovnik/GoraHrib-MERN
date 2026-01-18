# JWT Authentication Implementation Guide

A complete guide to implementing JWT (JSON Web Tokens) in your GoraHrib MERN application.

---

## Step 1: Install Required Package

```bash
npm install jsonwebtoken bcryptjs
```

- **jsonwebtoken**: For creating and verifying JWTs
- **bcryptjs**: For hashing passwords

---

## Step 2: Create a JWT Configuration File

Create `backend/config/jwt.js`:

```javascript
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRY = "7d"; // Token expires in 7 days

/**
 * Generate JWT token
 */
export function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
```

---

## Step 3: Create Authentication Middleware

Create `backend/middleware/auth.js`:

```javascript
import { verifyToken } from "../config/jwt.js";
import { StatusCodes } from "http-status-codes";

/**
 * Middleware to verify JWT token
 * Attaches decoded user data to req.user
 */
export async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "No token provided or invalid format",
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.slice(7);

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid or expired token",
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
}

/**
 * Optional: Check if user is admin
 */
export async function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Admin access required",
    });
  }
  next();
}
```

---

## Step 4: Update Auth Controller

Update `backend/controllers/auth.controller.js`:

```javascript
import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import { generateToken } from "../config/jwt.js";
import { StatusCodes } from "http-status-codes";

/**
 * Register new user
 */
export async function register(req, res) {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email, password, and username are required",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "User with this email or username already exists",
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      username,
      firstName,
      lastName,
    });

    // Generate token
    const token = generateToken(newUser._id);

    res.status(StatusCodes.CREATED).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Registration failed",
      error: error.message,
    });
  }
}

/**
 * Login user
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(StatusCodes.OK).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Login failed",
      error: error.message,
    });
  }
}

/**
 * Logout user
 * Note: JWT is stateless, so logout is typically handled client-side
 * by deleting the token. This endpoint is optional.
 */
export async function logout(req, res) {
  res.status(StatusCodes.OK).json({
    message: "Logout successful",
  });
}
```

---

## Step 5: Protect Your Routes

Update `backend/routes/auth.routes.js`:

```javascript
import express from "express";
import { login, register, logout } from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", authenticate, logout);

export default router;
```

Update `backend/routes/checklist.routes.js`:

```javascript
import express from "express";
import {
  getChecklist,
  addPeakToChecklist,
  removePeakFromChecklist,
  markPeakAsVisited,
} from "../controllers/checklist.controller.js";
import { authenticate } from "../middleware/auth.js";
import { actionLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// All checklist routes require authentication
router.get("/:userId", authenticate, actionLimiter, getChecklist);
router.post("/:peakId", authenticate, actionLimiter, addPeakToChecklist);
router.delete("/:peakId", authenticate, actionLimiter, removePeakFromChecklist);
router.put("/:peakId/visit", authenticate, actionLimiter, markPeakAsVisited);

export default router;
```

Update other protected routes similarly (`user.routes.js`, `friend.routes.js`, etc.):

```javascript
import { authenticate } from "../middleware/auth.js";

router.get("/:id", authenticate, getProfileById);
router.put("/:id", authenticate, updateProfileById);
```

---

## Step 6: Add JWT_SECRET to .env

Update `backend/.env`:

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
```

---

## Step 7: Update Your Controllers

Update `backend/controllers/checklist.controller.js` to use `req.user.id`:

```javascript
import Checklist from "../models/Checklist.js";
import { StatusCodes } from "http-status-codes";

// GET /checklist - Get current user's checklist
export async function getChecklist(req, res) {
  try {
    const userId = req.user.id; // From JWT token

    const checklist = await Checklist.find({ userId })
      .populate("peakId", "name elevation mountainRange")
      .sort({ createdAt: -1 });

    if (!checklist || checklist.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No checklist found" });
    }

    res.status(StatusCodes.OK).json({ checklist });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error", error: error.message });
  }
}

// POST /checklist/:peakId - Add peak to current user's checklist
export async function addPeakToChecklist(req, res) {
  try {
    const peakId = req.params.peakId;
    const userId = req.user.id; // From JWT token

    // Check if peak already in checklist
    const exists = await Checklist.findOne({ userId, peakId });
    if (exists) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Peak already in checklist" });
    }

    const newChecklistItem = await Checklist.create({
      userId,
      peakId,
      status: "Wishlist",
    });

    res.status(StatusCodes.CREATED).json({
      message: "Peak added to checklist",
      checklist: newChecklistItem,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error", error: error.message });
  }
}

// DELETE /checklist/:peakId - Remove peak from checklist
export async function removePeakFromChecklist(req, res) {
  try {
    const peakId = req.params.peakId;
    const userId = req.user.id;

    const result = await Checklist.deleteOne({ userId, peakId });

    if (result.deletedCount === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Peak not in checklist" });
    }

    res.status(StatusCodes.OK).json({ message: "Peak removed from checklist" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error", error: error.message });
  }
}

// PUT /checklist/:peakId/visit - Mark peak as visited
export async function markPeakAsVisited(req, res) {
  try {
    const peakId = req.params.peakId;
    const userId = req.user.id;

    const result = await Checklist.findOneAndUpdate(
      { userId, peakId },
      {
        status: "Visited",
        visitedDate: new Date(),
      },
      { new: true }
    );

    if (!result) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Peak not in checklist" });
    }

    res.status(StatusCodes.OK).json({
      message: "Peak marked as visited",
      checklist: result,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error", error: error.message });
  }
}
```

---

## Frontend Usage

### Register/Login

```javascript
// Register
const response = await fetch("http://localhost:3000/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
    username: "john_doe",
  }),
});

const data = await response.json();
const token = data.token;

// Store token in localStorage
localStorage.setItem("token", token);
```

### Make Authenticated Requests

```javascript
// Get user's checklist
const token = localStorage.getItem("token");
const response = await fetch("http://localhost:3000/api/checklist", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const data = await response.json();
console.log(data.checklist);
```

### Logout

```javascript
// Simply remove token from localStorage
localStorage.removeItem("token");
```

---

## Summary

| Step | File                                  | What to Do                                        |
| ---- | ------------------------------------- | ------------------------------------------------- |
| 1    | Terminal                              | `npm install jsonwebtoken bcryptjs`               |
| 2    | `config/jwt.js`                       | Create token generation/verification              |
| 3    | `middleware/auth.js`                  | Create authenticate middleware                    |
| 4    | `controllers/auth.controller.js`      | Implement register/login logic                    |
| 5    | `routes/*.routes.js`                  | Add `authenticate` middleware to protected routes |
| 6    | `.env`                                | Add `JWT_SECRET`                                  |
| 7    | `controllers/checklist.controller.js` | Use `req.user.id` instead of params               |

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get checklist (use token from login response)
curl -X GET http://localhost:3000/api/checklist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Best Practices

✅ **Store JWT in localStorage** (client-side)
✅ **Send token in Authorization header** with "Bearer " prefix
✅ **Use HTTPS in production** (don't send tokens over HTTP)
✅ **Set short expiry times** (7 days is reasonable)
✅ **Change JWT_SECRET in production** (use strong, random string)
✅ **Validate all input** before processing
✅ **Hash passwords** with bcrypt before storing
✅ **Protect sensitive routes** with authenticate middleware
