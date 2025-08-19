import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { StatusCodes } from "http-status-codes";

declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

export function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  passport.authenticate("jwt", { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Authentication error",
        message: "An error occurred during authentication"
      });
    }

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Unauthorized",
        message: info?.message || "Invalid or missing authentication token"
      });
    }

    // Attach user to request
    req.user = user;
    next();
  })(req, res, next);
}

export function optionalAuthenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Authentication error",
        message: "An error occurred during authentication"
      });
    }

    // Attach user to request if available, but don't require it
    if (user) {
      req.user = user;
    }
    
    next();
  })(req, res, next);
} 