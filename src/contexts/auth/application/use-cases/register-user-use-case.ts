import { v4 as uuidv4 } from "uuid";

import { Logger } from "@/shared/logger/logger";

import {
  RegisterUserCommand,
  RegisterUserCommandResult,
} from "@/contexts/auth/application/commands/register-user-command";
import {
  AuthResult,
  AuthResultBuilder,
} from "@/contexts/auth/application/results/auth-result";
import { AuthDomainService } from "@/contexts/auth/domain/services/auth-domain-service";
import { Password } from "@/contexts/auth/domain/value-objects/password";
import { TransactionManager } from "@/contexts/shared/infrastructure/transaction/transaction-manager";
import { User } from "@/contexts/users/domain/entities/user";
import { UserRepository } from "@/contexts/users/domain/repositories/user-repository";
import { Email } from "@/contexts/users/domain/value-objects/email";
import { UserId } from "@/contexts/users/domain/value-objects/user-id";
import { UserName } from "@/contexts/users/domain/value-objects/user-name";
import { UserPlan } from "@/contexts/users/domain/value-objects/user-plan";
import { UserRole } from "@/contexts/users/domain/value-objects/user-role";

export class RegisterUserUseCase {
  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(
    command: RegisterUserCommand,
  ): Promise<AuthResult<RegisterUserCommandResult>> {
    let transaction: any;

    try {
      this.logger.info("Registering new user", { email: command.email });

      // Validate input
      if (!command.email || !command.password || !command.name) {
        return AuthResultBuilder.error(
          "Email, password, and name are required",
          "VALIDATION_ERROR",
        );
      }

      // Create value objects
      let email: Email;
      let password: Password;
      let name: UserName;
      let role: UserRole;
      let plan: UserPlan;
      let profileImage: string | null = null;

      if (command.profileImage) {
        profileImage = command.profileImage;
      }

      try {
        email = new Email(command.email);
      } catch (error) {
        return AuthResultBuilder.error(
          error instanceof Error ? error.message : "Invalid email format",
          "INVALID_EMAIL",
        );
      }

      try {
        password = Password.create(command.password);
      } catch (error) {
        return AuthResultBuilder.error(
          error instanceof Error ? error.message : "Invalid password",
          "INVALID_PASSWORD",
        );
      }

      try {
        name = new UserName(command.name);
      } catch (error) {
        return AuthResultBuilder.error(
          error instanceof Error ? error.message : "Invalid name format",
          "INVALID_NAME",
        );
      }

      try {
        role = command.role ? UserRole.create(command.role) : UserRole.user();
      } catch (error) {
        return AuthResultBuilder.error(
          error instanceof Error ? error.message : "Invalid role format",
          "INVALID_ROLE",
        );
      }

      try {
        plan = command.plan
          ? UserPlan.create(command.plan)
          : UserPlan.standard();
      } catch (error) {
        return AuthResultBuilder.error(
          error instanceof Error ? error.message : "Invalid plan format",
          "INVALID_PLAN",
        );
      }

      // Generate user ID
      const userId = uuidv4();

      // Begin transaction
      transaction = await this.transactionManager.beginTransaction();

      try {
        // Register user credentials
        const userCredentials = await this.authDomainService.registerUser(
          email,
          password,
          userId,
          transaction,
        );

        // Create user entity
        const user = new User(
          new UserId(userId),
          email,
          name,
          new Date(),
          profileImage,
          true,
          false,
          role,
          plan,
        );

        // Save user
        await this.userRepository.save(user, transaction);

        // Commit transaction
        await this.transactionManager.commitTransaction(transaction);

        this.logger.info("User registered successfully", {
          email: command.email,
          userId,
        });

        return AuthResultBuilder.success(
          {
            userId,
            email: command.email,
            name: command.name,
            profileImage: user.getProfileImage(),
            isActive: user.getIsActive(),
            isVerified: user.getIsVerified(),
            role: user.getRole().getValue().toString(),
            plan: user.getPlan().getValue().toString(),
          },
          "User registered successfully",
        );
      } catch (error) {
        // Only try to rollback if the transaction hasn't been committed
        try {
          if (transaction && !transaction.isCommitted) {
            await this.transactionManager.rollbackTransaction(transaction);
          }
        } catch (rollbackError) {
          this.logger.warn("Failed to rollback transaction", {
            transactionId: transaction?.getId(),
            rollbackError,
          });
        }
        throw error;
      }
    } catch (error) {
      this.logger.error("Error registering user", {
        error,
        email: command.email,
      });

      if (error instanceof Error) {
        return AuthResultBuilder.error(error.message, "REGISTRATION_ERROR", {
          originalError: error.message,
        });
      }

      return AuthResultBuilder.error(
        "An unexpected error occurred during registration",
        "UNKNOWN_ERROR",
        { originalError: String(error) },
      );
    }
  }
}
