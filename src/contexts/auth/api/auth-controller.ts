import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Logger } from "@/shared/logger/logger";
import { RegisterUserUseCase } from "@/contexts/auth/application/use-cases/register-user-use-case";
import { LoginUseCase } from "@/contexts/auth/application/use-cases/login-use-case";
import { ChangePasswordUseCase } from "@/contexts/auth/application/use-cases/change-password-use-case";
import { GetUserProfileUseCase } from "@/contexts/auth/application/use-cases/get-user-profile-use-case";
import { AuthenticatedRequest } from "@/app/infrastructure/passport/auth-middleware";
import { RegisterUserCommand } from "@/contexts/auth/application/commands/register-user-command";
import { ChangePasswordCommand } from "@/contexts/auth/application/commands/change-password-command";
import { AuthenticateUserQuery } from "@/contexts/auth/application/queries/authenticate-user-query";
import { GetUserProfileQuery } from "@/contexts/auth/application/queries/get-user-profile-query";

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly logger: Logger
  ) {}

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const command: RegisterUserCommand = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        role: req.body.role,
        plan: req.body.plan,
        profileImage: req.body.profileImage,
      };

      const result = await this.registerUserUseCase.execute(command);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: result.error,
          errorCode: result.errorCode,
          details: result.details,
          timestamp: result.timestamp
        });
      }

      return res.status(StatusCodes.CREATED).json({
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      this.logger.error("Unexpected error in register", { error });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error"
      });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const query: AuthenticateUserQuery = {
        email: req.body.email,
        password: req.body.password
      };

      const result = await this.loginUseCase.execute(query);

      if (!result.success) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: result.error,
          errorCode: result.errorCode,
          details: result.details,
          timestamp: result.timestamp
        });
      }

      return res.status(StatusCodes.OK).json({
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      this.logger.error("Unexpected error in login", { error });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error"
      });
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: "Unauthorized",
          message: "Authentication required"
        });
      }

      const command: ChangePasswordCommand = {
        userId: req.user.userId,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword
      };

      const result = await this.changePasswordUseCase.execute(command);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: result.error,
          errorCode: result.errorCode,
          details: result.details,
          timestamp: result.timestamp
        });
      }

      return res.status(StatusCodes.OK).json({
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      this.logger.error("Unexpected error in changePassword", { error });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error"
      });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: "Unauthorized",
          message: "Authentication required"
        });
      }

      const query: GetUserProfileQuery = {
        userId: req.user.userId
      };

      const result = await this.getUserProfileUseCase.execute(query);

      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: result.error,
          errorCode: result.errorCode,
          details: result.details,
          timestamp: result.timestamp
        });
      }

      return res.status(StatusCodes.OK).json({
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      this.logger.error("Unexpected error in getProfile", { error });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error"
      });
    }
  }
} 