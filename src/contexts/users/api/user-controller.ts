import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { Logger } from "@/shared/logger/logger";
import { GetUserUseCase } from "@/contexts/users/application/use-cases/get-user-use-case";
import { GetUsersUseCase } from "@/contexts/users/application/use-cases/get-users-use-case";

export class UserController {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly logger: Logger
  ) {}

  async getUser(req: Request, res: Response) {
    try {
      const result = await this.getUserUseCase.execute({
        userId: req.params.id
      });

      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: result.error,
          errorCode: result.errorCode
        });
      }

      return res.status(StatusCodes.OK).json({
        data: result.data,
        message: "User retrieved successfully"
      });
    } catch (error) {
      this.logger.error("Unexpected error in getUser", { error });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error"
      });
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const result = await this.getUsersUseCase.execute({
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        name: req.query.name as string,
        domain: req.query.domain as string
      });

      if (!result.success) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: result.error,
          errorCode: result.errorCode
        });
      }

      return res.status(StatusCodes.OK).json({
        data: result.data,
        message: "Users retrieved successfully"
      });
    } catch (error) {
      this.logger.error("Unexpected error in getUsers", { error });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error"
      });
    }
  }
}
