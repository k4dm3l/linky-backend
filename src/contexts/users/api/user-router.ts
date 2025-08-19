import express from "express";
import { UserController } from "@/contexts/users/api/user-controller";
import { authenticateJwt } from "@/app/infrastructure/passport/auth-middleware";
import { validateQuery, validateParams } from "@/app/infrastructure/validation/validation-middleware";
import { getUsersQuerySchema, getUserParamsSchema } from "@/contexts/users/api/validation-schemas";

const userRouter = express.Router();

// This will be injected by the server setup
let userController: UserController;
let rateLimitService: any;

export function setUserController(controller: UserController): void {
  userController = controller;
}

export function setRateLimitService(service: any): void {
  rateLimitService = service;
}

// GET /api/users - Get all users with pagination and filtering
// Requires authentication and applies strict rate limiting for read operations
userRouter.get("/", 
  authenticateJwt,
  validateQuery(getUsersQuerySchema),
  rateLimitService?.getStrictLimiter() || ((req: any, res: any, next: any) => next()),
  (req, res) => {
    userController.getUsers(req, res).catch((error) => {
      console.error("Error in getUsers:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  }
);

// GET /api/users/:id - Get a specific user by ID
// Requires authentication and applies strict rate limiting for read operations
userRouter.get("/:id", 
  authenticateJwt,
  validateParams(getUserParamsSchema),
  rateLimitService?.getStrictLimiter() || ((req: any, res: any, next: any) => next()),
  (req, res) => {
    userController.getUser(req, res).catch((error) => {
      console.error("Error in getUser:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  }
);

export { userRouter };
