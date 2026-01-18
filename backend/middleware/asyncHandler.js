/**
 * Async handler wrapper to catch errors in async route handlers
 * and pass them to Express error handling middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
