import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConsoleLogger } from "@/shared/logger/console-logger";

import { CreateUserUseCase } from "@/contexts/users/application/use-cases/create-user-use-case";
import { UserDomainService } from "@/contexts/users/domain/services/user-domain-service";
import { InMemoryUserRepository } from "@/contexts/users/infrastructure/repositories/in-memory-user-repository";

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let userRepository: InMemoryUserRepository;
  let userDomainService: UserDomainService;
  let logger: ConsoleLogger;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userDomainService = new UserDomainService(userRepository);
    logger = new ConsoleLogger();
    useCase = new CreateUserUseCase(userDomainService, logger);
  });

  it("should create a user successfully", async () => {
    const command = {
      email: "test@example.com",
      name: "John Doe",
    };

    const result = await useCase.execute(command);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.email).toBe("test@example.com");
    expect(result.data!.name).toBe("John Doe");
    expect(result.data!.id).toBeDefined();
    expect(result.data!.createdAt).toBeInstanceOf(Date);
  });

  it("should return validation error for missing email", async () => {
    const command = {
      email: "",
      name: "John Doe",
    };

    const result = await useCase.execute(command);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Email cannot be empty");
    expect(result.errorCode).toBe("VALIDATION_ERROR");
  });

  it("should return validation error for missing name", async () => {
    const command = {
      email: "test@example.com",
      name: "",
    };

    const result = await useCase.execute(command);

    expect(result.success).toBe(false);
    expect(result.error).toBe("User name cannot be empty");
    expect(result.errorCode).toBe("VALIDATION_ERROR");
  });

  it("should return validation error for invalid email format", async () => {
    const command = {
      email: "invalid-email",
      name: "John Doe",
    };

    const result = await useCase.execute(command);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Email must be in a valid format");
    expect(result.errorCode).toBe("VALIDATION_ERROR");
  });

  it("should return validation error for invalid name format", async () => {
    const command = {
      email: "test@example.com",
      name: "J", // Too short
    };

    const result = await useCase.execute(command);

    expect(result.success).toBe(false);
    expect(result.error).toBe("User name must be at least 2 characters long");
    expect(result.errorCode).toBe("VALIDATION_ERROR");
  });

  it("should return error when user already exists", async () => {
    // Create first user
    const command1 = {
      email: "test@example.com",
      name: "John Doe",
    };
    await useCase.execute(command1);

    // Try to create second user with same email
    const command2 = {
      email: "test@example.com",
      name: "Jane Smith",
    };
    const result = await useCase.execute(command2);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "User with email test@example.com already exists",
    );
    expect(result.errorCode).toBe("INTERNAL_ERROR");
  });

  it("should handle unexpected errors gracefully", async () => {
    // Mock the domain service to throw an unexpected error
    const mockDomainService = {
      createUser: vi
        .fn()
        .mockRejectedValue(new Error("Database connection failed")),
    };

    const useCaseWithMock = new CreateUserUseCase(
      mockDomainService as any,
      logger,
    );

    const command = {
      email: "test@example.com",
      name: "John Doe",
    };

    const result = await useCaseWithMock.execute(command);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Database connection failed");
    expect(result.errorCode).toBe("INTERNAL_ERROR");
  });
});
