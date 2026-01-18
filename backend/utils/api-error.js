import { StatusCodes } from "http-status-codes";

export class ApiError extends Error {
  constructor(message, statusCode) {
    // Call the parent Error contructor
    super(message);

    this.statusCode = statusCode;

    // Capture the stack trace (excluding constructor call from it)
    Error.captureStackTrace(this, this.constructor);
  }
}

/*
 * A few common HTTP error subclasses
 */
export class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(message, StatusCodes.CONFLICT);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "Internal Server Error") {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
