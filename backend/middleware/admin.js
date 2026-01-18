import { StatusCodes } from "http-status-codes";

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Nimate dostopa",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Samo administratorji imajo dostop do te funkcije",
    });
  }

  next();
};
