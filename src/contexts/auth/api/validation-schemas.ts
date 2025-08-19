import Joi from "joi";

// Register user schema
export const registerUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
    "string.empty": "Email cannot be empty",
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 128 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name cannot exceed 100 characters",
      "string.pattern.base": "Name can only contain letters and spaces",
      "any.required": "Name is required",
      "string.empty": "Name cannot be empty",
    }),
  profileImage: Joi.string().uri().allow(null, "").optional().messages({
    "string.uri": "Profile image must be a valid URL",
  }),
  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be a boolean",
  }),
  isVerified: Joi.boolean().optional().messages({
    "boolean.base": "isVerified must be a boolean",
  }),
  role: Joi.string().valid("ADMIN", "USER").optional().messages({
    "any.only": "Role must be either ADMIN or USER",
  }),
  plan: Joi.string().valid("STANDARD", "PREMIUM").optional().messages({
    "any.only": "Plan must be either STANDARD or PREMIUM",
  }),
}).required();

// Login schema
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
    "string.empty": "Email cannot be empty",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
  }),
});

// Change password schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
    "string.empty": "Current password cannot be empty",
  }),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "New password must be at least 8 characters long",
      "string.max": "New password cannot exceed 128 characters",
      "string.pattern.base":
        "New password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "New password is required",
      "string.empty": "New password cannot be empty",
    }),
});
