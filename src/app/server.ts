import http from "node:http";
import { AddressInfo } from "node:net";

import compression from "compression";
import express, { Express } from "express";
import helmet from "helmet";
import passport from "passport";

import { config } from "@/app/config/config";
import { setupContainer } from "@/app/di/setup";
import { healthRouter } from "@/app/health/api/health-router";
import { notFoundMiddleware } from "@/app/infrastructure/middleware/not-found-middleware";
import { configurePassport } from "@/app/infrastructure/passport/passport-config";
import { RateLimitService } from "@/app/infrastructure/rate-limiting/rate-limit-service";

import { ConsoleLogger } from "@/shared/logger/console-logger";
import { Logger } from "@/shared/logger/logger";

import { AuthController } from "@/contexts/auth/api/auth-controller";
import { setAuthController } from "@/contexts/auth/api/auth-router";
import { authRouter } from "@/contexts/auth/api/auth-router";
import { UserController } from "@/contexts/users/api/user-controller";
import {
  setRateLimitService,
  setUserController,
} from "@/contexts/users/api/user-router";
import { userRouter } from "@/contexts/users/api/user-router";
import { UserCredentialsRepository } from "@/contexts/auth/domain/repositories/user-credentials-repository";
import { UserRepository } from "@/contexts/users/domain/repositories/user-repository";

export class Server {
  private readonly app: Express;
  private httpServer?: http.Server;
  private readonly logger: Logger;
  private readonly container: ReturnType<typeof setupContainer>;

  constructor() {
    this.logger = new ConsoleLogger();
    this.container = setupContainer();
    this.app = express();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Basic middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(compression());
    this.app.use(helmet());

    // Initialize Passport
    this.app.use(passport.initialize());

    // Configure Passport with JWT strategy
    const userCredentialsRepository = this.container.resolve(
      "userCredentialsRepository",
    ) as unknown as UserCredentialsRepository;
    const userRepository = this.container.resolve(
      "userRepository",
    ) as unknown as UserRepository;

    configurePassport(userCredentialsRepository, userRepository);
  }

  private setupRoutes(): void {
    // Health check endpoint (no rate limiting for health checks)
    this.app.use(`/api/${config.apiVersion}/health`, healthRouter);

    // Set up controllers and rate limit service with dependency injection
    const userController =
      this.container.resolve<UserController>("userController");
    const authController =
      this.container.resolve<AuthController>("authController");
    const rateLimitService =
      this.container.resolve<RateLimitService>("rateLimitService");

    setUserController(userController);
    setAuthController(authController);
    setRateLimitService(rateLimitService);

    // Global rate limiting for all routes EXCEPT health (applied after health route)
    this.app.use(rateLimitService.getGlobalLimiter());

    // Auth endpoints with specific rate limiting applied in the router
    this.app.use(`/api/${config.apiVersion}/auth`, authRouter);

    // User endpoints with specific rate limiting applied in the router
    this.app.use(`/api/${config.apiVersion}/users`, userRouter);

    // 404 handler - must be last after all routes
    this.app.use(notFoundMiddleware);
  }

  async start(): Promise<void> {
    return new Promise(resolve => {
      this.httpServer = this.app.listen(config.server.port, () => {
        const { port } = this.httpServer?.address() as AddressInfo;
        this.logger.info(`App is ready and listening on port ${port} 🚀`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.httpServer) {
        this.httpServer.close(error => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }

      resolve();
    });
  }

  getHttpServer(): http.Server {
    if (!this.httpServer) {
      throw new Error("Server has not been started yet");
    }

    return this.httpServer;
  }

  getContainer() {
    return this.container;
  }
}
