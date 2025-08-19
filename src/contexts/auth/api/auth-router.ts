import express from "express";
import { AuthController } from "@/contexts/auth/api/auth-controller";
import { authenticateJwt } from "@/app/infrastructure/passport/auth-middleware";
import { validateRequest } from "@/app/infrastructure/validation/validation-middleware";
import { 
  registerUserSchema, 
  loginSchema, 
  changePasswordSchema 
} from "./validation-schemas";

const authRouter = express.Router();

// This will be injected by the server setup
let authController: AuthController;
let rateLimitService: any;

export function setAuthController(controller: AuthController): void {
  authController = controller;
}

export function setRateLimitService(service: any): void {
  rateLimitService = service;
}

// POST /api/auth/register - Register a new user
authRouter.post("/sign-up", 
  validateRequest(registerUserSchema),
  rateLimitService?.getAuthLimiter() || ((req: any, res: any, next: any) => next()),
  (req, res) => {
    authController.register(req, res).catch((error) => {
      console.error("Error in register:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  }
);

// POST /api/auth/login - Login user
authRouter.post("/sign-in", 
  validateRequest(loginSchema),
  rateLimitService?.getAuthLimiter() || ((req: any, res: any, next: any) => next()),
  (req, res) => {
    authController.login(req, res).catch((error) => {
      console.error("Error in login:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  }
);

// PATCH /api/auth/change-password - Change password (requires authentication)
authRouter.patch("/change-password", 
  authenticateJwt,
  validateRequest(changePasswordSchema),
  rateLimitService?.getStrictLimiter() || ((req: any, res: any, next: any) => next()),
  (req, res) => {
    authController.changePassword(req, res).catch((error) => {
      console.error("Error in changePassword:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  }
);

// GET /api/auth/profile - Get user profile (requires authentication)
authRouter.get("/profile", 
  authenticateJwt,
  rateLimitService?.getStrictLimiter() || ((req: any, res: any, next: any) => next()),
  (req, res) => {
    authController.getProfile(req, res).catch((error) => {
      console.error("Error in getProfile:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  }
);

export { authRouter }; 