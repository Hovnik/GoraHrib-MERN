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
