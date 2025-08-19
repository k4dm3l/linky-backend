import { AuthDomainService } from "@/contexts/auth/domain/services/auth-domain-service";
import { ChangePasswordCommand, ChangePasswordCommandResult } from "@/contexts/auth/application/commands/change-password-command";
import { AuthResult, AuthResultBuilder } from "@/contexts/auth/application/results/auth-result";
import { Password } from "@/contexts/auth/domain/value-objects/password";
import { Logger } from "@/shared/logger/logger";
import { TransactionManager } from "@/contexts/shared/infrastructure/transaction/transaction-manager";

export class ChangePasswordUseCase {
  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly logger: Logger,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: ChangePasswordCommand): Promise<AuthResult<ChangePasswordCommandResult>> {
    let transaction: any;
    
    try {
      this.logger.info("Changing password for user", { userId: command.userId });

      // Validate input
      if (!command.currentPassword || !command.newPassword) {
        return AuthResultBuilder.error(
          "Current password and new password are required",
          "VALIDATION_ERROR"
        );
      }

      // Create password value object
      let newPassword: Password;

      try {
        newPassword = Password.create(command.newPassword);
      } catch (error) {
        return AuthResultBuilder.error(
          error instanceof Error ? error.message : "Invalid new password",
          "INVALID_PASSWORD"
        );
      }

      // Begin transaction
      transaction = await this.transactionManager.beginTransaction();

      try {
        // Change password
        const updatedCredentials = await this.authDomainService.changePassword(
          command.userId,
          command.currentPassword,
          newPassword,
          transaction
        );

        // Commit transaction
        await this.transactionManager.commitTransaction(transaction);

        this.logger.info("Password changed successfully", { userId: command.userId });

        return AuthResultBuilder.success({
          userId: updatedCredentials.getUserId(),
          message: "Password changed successfully"
        }, "Password changed successfully");

      } catch (error) {
        // Only try to rollback if the transaction hasn't been committed
        try {
          if (transaction && !(transaction as any).isCommitted) {
            await this.transactionManager.rollbackTransaction(transaction);
          }
        } catch (rollbackError) {
          this.logger.warn("Failed to rollback transaction", { 
            transactionId: transaction?.getId(),
            rollbackError 
          });
        }
        throw error;
      }

    } catch (error) {
      this.logger.error("Error changing password", { error, userId: command.userId });
      
      if (error instanceof Error) {
        return AuthResultBuilder.error(
          error.message,
          "PASSWORD_CHANGE_ERROR",
          { originalError: error.message }
        );
      }

      return AuthResultBuilder.error(
        "An unexpected error occurred while changing password",
        "UNKNOWN_ERROR",
        { originalError: String(error) }
      );
    }
  }
} 