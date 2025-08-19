import jwt from "jsonwebtoken";

import { Logger } from "@/shared/logger/logger";

import {
  AuthenticateUserQuery,
  AuthenticateUserQueryResult,
} from "@/contexts/auth/application/queries/authenticate-user-query";
import {
  AuthResult,
  AuthResultBuilder,
} from "@/contexts/auth/application/results/auth-result";
import { AuthDomainService } from "@/contexts/auth/domain/services/auth-domain-service";
import { JwtToken } from "@/contexts/auth/domain/value-objects/jwt-token";
import { Password } from "@/contexts/auth/domain/value-objects/password";
import { TransactionManager } from "@/contexts/shared/infrastructure/transaction/transaction-manager";
import { Email } from "@/contexts/users/domain/value-objects/email";

export class LoginUseCase {
  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly logger: Logger,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(
    query: AuthenticateUserQuery,
  ): Promise<AuthResult<AuthenticateUserQueryResult>> {
    let transaction: any;

    try {
      this.logger.info("Authenticating user", { email: query.email });

      // Validate input
      if (!query.email || !query.password) {
        return AuthResultBuilder.error(
          "Email and password are required",
          "VALIDATION_ERROR",
        );
      }

      // Create value objects
      let email: Email;
      let password: Password;

      try {
        email = new Email(query.email);
      } catch (error) {
        return AuthResultBuilder.error(
          error instanceof Error ? error.message : "Invalid email format",
          "INVALID_EMAIL",
        );
      }

      try {
        password = Password.create(query.password);
      } catch (error) {
        return AuthResultBuilder.error(
          error instanceof Error ? error.message : "Invalid password",
          "INVALID_PASSWORD",
        );
      }

      // Begin transaction
      transaction = await this.transactionManager.beginTransaction();

      try {
        // Authenticate user
        const userCredentials = await this.authDomainService.authenticateUser(
          email,
          query.password,
          transaction,
        );

        // Generate JWT token (simple implementation for now)
        const tokenValue = this.generateJwtToken(
          userCredentials.getUserId(),
          userCredentials.getEmail().getValue(),
        );
        const token = new JwtToken(tokenValue);

        // Commit transaction
        await this.transactionManager.commitTransaction(transaction);

        this.logger.info("User authenticated successfully", {
          email: query.email,
          userId: userCredentials.getUserId(),
        });

        return AuthResultBuilder.success(
          {
            userId: userCredentials.getUserId(),
            email: userCredentials.getEmail().getValue(),
            token: token.getValue(),
          },
          "Login successful",
        );
      } catch (error) {
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
      this.logger.error("Error authenticating user", {
        error,
        email: query.email,
      });

      if (error instanceof Error) {
        return AuthResultBuilder.error(error.message, "AUTHENTICATION_ERROR", {
          originalError: error.message,
        });
      }

      return AuthResultBuilder.error(
        "An unexpected error occurred during authentication",
        "UNKNOWN_ERROR",
        { originalError: String(error) },
      );
    }
  }

  private generateJwtToken(userId: string, email: string): string {
    const secret = process.env.JWT_SECRET || "your-secret-key";

    const payload = {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    return jwt.sign(payload, secret);
  }
}
