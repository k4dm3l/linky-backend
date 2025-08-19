import { Container } from "@/app/di/container";
import { ExpressRateLimitService } from "@/app/infrastructure/rate-limiting/rate-limit-service";

import { ConsoleLogger } from "@/shared/logger/console-logger";

import { AuthController } from "@/contexts/auth/api/auth-controller";
import { ChangePasswordUseCase } from "@/contexts/auth/application/use-cases/change-password-use-case";
import { GetUserProfileUseCase } from "@/contexts/auth/application/use-cases/get-user-profile-use-case";
import { LoginUseCase } from "@/contexts/auth/application/use-cases/login-use-case";
import { RegisterUserUseCase } from "@/contexts/auth/application/use-cases/register-user-use-case";
import { AuthDomainService } from "@/contexts/auth/domain/services/auth-domain-service";
// Auth imports
import { InMemoryUserCredentialsRepository } from "@/contexts/auth/infrastructure/repositories/in-memory-user-credentials-repository";
// Shared infrastructure imports
import { InMemoryTransactionManager } from "@/contexts/shared/infrastructure/transaction/transaction-manager";
import { UserController } from "@/contexts/users/api/user-controller";
import { GetUserUseCase } from "@/contexts/users/application/use-cases/get-user-use-case";
import { GetUsersUseCase } from "@/contexts/users/application/use-cases/get-users-use-case";
import { UserDomainService } from "@/contexts/users/domain/services/user-domain-service";
import { InMemoryUserRepository } from "@/contexts/users/infrastructure/repositories/in-memory-user-repository";

export function setupContainer(): Container {
  const container = new Container();

  // Register shared services
  container.registerSingleton("logger", () => new ConsoleLogger());
  container.registerSingleton(
    "transactionManager",
    () => new InMemoryTransactionManager(),
  );

  // Register infrastructure services
  container.registerSingleton(
    "rateLimitService",
    () => new ExpressRateLimitService(),
  );

  // Register repositories
  container.registerSingleton(
    "userRepository",
    () => new InMemoryUserRepository(),
  );
  container.registerSingleton(
    "userCredentialsRepository",
    () => new InMemoryUserCredentialsRepository(),
  );

  // Register domain services
  container.registerSingleton(
    "userDomainService",
    () => new UserDomainService(container.resolve("userRepository")),
  );

  container.registerSingleton(
    "authDomainService",
    () =>
      new AuthDomainService(
        container.resolve("userCredentialsRepository"),
        container.resolve("logger"),
      ),
  );

  // Register use cases
  container.registerSingleton(
    "getUserUseCase",
    () =>
      new GetUserUseCase(
        container.resolve("userDomainService"),
        container.resolve("logger"),
      ),
  );

  container.registerSingleton(
    "getUsersUseCase",
    () =>
      new GetUsersUseCase(
        container.resolve("userRepository"),
        container.resolve("logger"),
      ),
  );

  // Auth use cases
  container.registerSingleton(
    "registerUserUseCase",
    () =>
      new RegisterUserUseCase(
        container.resolve("authDomainService"),
        container.resolve("userRepository"),
        container.resolve("logger"),
        container.resolve("transactionManager"),
      ),
  );

  container.registerSingleton(
    "loginUseCase",
    () =>
      new LoginUseCase(
        container.resolve("authDomainService"),
        container.resolve("logger"),
        container.resolve("transactionManager"),
      ),
  );

  container.registerSingleton(
    "changePasswordUseCase",
    () =>
      new ChangePasswordUseCase(
        container.resolve("authDomainService"),
        container.resolve("logger"),
        container.resolve("transactionManager"),
      ),
  );

  container.registerSingleton(
    "getUserProfileUseCase",
    () =>
      new GetUserProfileUseCase(
        container.resolve("userRepository"),
        container.resolve("logger"),
        container.resolve("transactionManager"),
      ),
  );

  // Register controllers
  container.registerSingleton(
    "userController",
    () =>
      new UserController(
        container.resolve("getUserUseCase"),
        container.resolve("getUsersUseCase"),
        container.resolve("logger"),
      ),
  );

  container.registerSingleton(
    "authController",
    () =>
      new AuthController(
        container.resolve("registerUserUseCase"),
        container.resolve("loginUseCase"),
        container.resolve("changePasswordUseCase"),
        container.resolve("getUserProfileUseCase"),
        container.resolve("logger"),
      ),
  );

  return container;
}
