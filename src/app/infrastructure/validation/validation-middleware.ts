import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Schema, ValidationError } from "joi";

export interface ValidationOptions {
  abortEarly?: boolean;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
}

export function validateRequest(
  schema: Schema,
  options: ValidationOptions = {}
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
      ...options,
    };

    // Validate request body (handle undefined as empty object)
    const { error, value } = schema.validate(req.body ?? {}, validationOptions);

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        error: "Validation Error",
        message: "Request validation failed",
        details: errorDetails,
        errorCode: "VALIDATION_ERROR"
      });
    }

    // Replace request body with validated data
    req.body = value;
    next();
  };
}

export function validateQuery(
  schema: Schema,
  options: ValidationOptions = {}
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
      ...options,
    };

    // Validate request query
    const { error, value } = schema.validate(req.query, validationOptions);

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Validation Error",
        message: "Query validation failed",
        details: errorDetails,
        errorCode: "VALIDATION_ERROR"
      });
    }

    // Validation passed, continue to next middleware
    next();
  };
}

export function validateParams(
  schema: Schema,
  options: ValidationOptions = {}
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
      ...options,
    };

    // Validate request params
    const { error, value } = schema.validate(req.params, validationOptions);

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Validation Error",
        message: "Parameter validation failed",
        details: errorDetails,
        errorCode: "VALIDATION_ERROR"
      });
    }

    // Validation passed, continue to next middleware
    next();
  };
} 