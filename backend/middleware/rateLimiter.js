import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => process.env.NODE_ENV === "development", // Skip in development
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests, please try again later.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Auth rate limiter (strict)
 * Limits: 5 requests per 15 minutes per IP
 * Protects against brute force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many login/register attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many authentication attempts. Please try again later.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Forum rate limiter (moderate)
 * Limits: 30 requests per 15 minutes per user
 * Protects against spam in forum posts and comments
 */
export const forumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: "Too many forum requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many forum requests. Please slow down.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Achievement/Checklist rate limiter
 * Limits: 60 requests per 15 minutes per user
 * More lenient for user action tracking
 */
export const actionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many actions, please try again later.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Search rate limiter
 * Limits: 30 requests per minute per user
 * Protects database from expensive search queries
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many search requests. Please try again later.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Friend request rate limiter
 * Limits: 10 friend requests per hour per user
 */
export const friendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many friend requests. Please try again later.",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});
