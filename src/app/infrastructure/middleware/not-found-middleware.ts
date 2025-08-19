import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Only handle requests that haven't been handled by any route
  if (res.headersSent) {
    return next();
  }

  res.status(StatusCodes.NOT_FOUND).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} not found`,
    errorCode: "ROUTE_NOT_FOUND",
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  });
} 