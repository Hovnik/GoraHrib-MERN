import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRY = "7d"; // Token expires in 7 days

/**
 * Generate JWT token
 */
export function generateToken(userId, role = "USER") {
  return jwt.sign({ id: userId, role: role }, JWT_SECRET, {
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
