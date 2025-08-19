import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { vi } from "vitest";

import { ConsoleLogger } from "@/shared/logger/console-logger";
import { Logger } from "@/shared/logger/logger";

import { UserController } from "@/contexts/users/api/user-controller";
import { GetUserUseCase } from "@/contexts/users/application/use-cases/get-user-use-case";
import { GetUsersUseCase } from "@/contexts/users/application/use-cases/get-users-use-case";

describe("UserController", () => {
  let controller: UserController;
  let logger: Logger;
  let getUserUseCase: GetUserUseCase;
  let getUsersUseCase: GetUsersUseCase;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = {} as Request;
    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      json: vi.fn(),
    } as unknown as Response;

    logger = new ConsoleLogger();
    getUserUseCase = {
      execute: vi.fn(),
    } as unknown as GetUserUseCase;
    getUsersUseCase = {
      execute: vi.fn(),
    } as unknown as GetUsersUseCase;

    controller = new UserController(getUserUseCase, getUsersUseCase, logger);
  });

  describe("getUser", () => {
    it("should respond with status 200 when user is found", async () => {
      const mockUser = { id: "123", name: "Test User" };
      (getUserUseCase.execute as any).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      req.params = { id: "123" };

      await controller.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        data: mockUser,
        message: "User retrieved successfully",
      });
    });
  });
});
