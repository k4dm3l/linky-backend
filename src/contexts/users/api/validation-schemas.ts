import Joi from "joi";

// Get users query schema (for pagination and filtering)
export const getUsersQuerySchema = Joi.object({
  offset: Joi.number().integer().min(0).optional().messages({
    "number.base": "Offset must be a number",
    "number.integer": "Offset must be an integer",
    "number.min": "Offset must be 0 or greater",
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be 1 or greater",
    "number.max": "Limit cannot exceed 100",
  }),
  name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "Name filter must be at least 1 character",
    "string.max": "Name filter cannot exceed 100 characters",
  }),
  domain: Joi.string().min(1).max(100).optional().messages({
    "string.min": "Domain filter must be at least 1 character",
    "string.max": "Domain filter cannot exceed 100 characters",
  }),
});

// Get user by ID params schema
export const getUserParamsSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "User ID is required",
    "string.empty": "User ID cannot be empty",
  }),
});
