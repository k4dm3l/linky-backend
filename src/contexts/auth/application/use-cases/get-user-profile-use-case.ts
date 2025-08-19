import { GetUserProfileQuery, GetUserProfileQueryResult } from "@/contexts/auth/application/queries/get-user-profile-query";
import { AuthResult, AuthResultBuilder } from "@/contexts/auth/application/results/auth-result";
import { Logger } from "@/shared/logger/logger";
import { UserRepository } from "@/contexts/users/domain/repositories/user-repository";
import { UserId } from "@/contexts/users/domain/value-objects/user-id";
import { TransactionManager } from "@/contexts/shared/infrastructure/transaction/transaction-manager";

export class GetUserProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(query: GetUserProfileQuery): Promise<AuthResult<GetUserProfileQueryResult>> {
    let transaction: any;
    
    try {
      this.logger.info("Getting user profile", { userId: query.userId });

      // Validate input
      if (!query.userId) {
        return AuthResultBuilder.error(
          "User ID is required",
          "VALIDATION_ERROR"
        );
      }

      // Create user ID value object
      let userId: UserId;
      try {
        userId = new UserId(query.userId);
      } catch (error) {
        return AuthResultBuilder.error(
          error instanceof Error ? error.message : "Invalid user ID format",
          "INVALID_USER_ID"
        );
      }

      // Begin transaction
      transaction = await this.transactionManager.beginTransaction();

      try {
        // Get user profile
        const user = await this.userRepository.findById(userId, transaction);
        
        if (!user) {
          return AuthResultBuilder.error(
            "User not found",
            "USER_NOT_FOUND"
          );
        }

        // Commit transaction
        await this.transactionManager.commitTransaction(transaction);

        this.logger.info("User profile retrieved successfully", { userId: query.userId });

        return AuthResultBuilder.success({
          userId: user.getId().getValue(),
          email: user.getEmail().getValue(),
          name: user.getName().getValue(),
          profileImage: user.getProfileImage(),
          isActive: user.getIsActive(),
          isVerified: user.getIsVerified(),
          role: user.getRole().getValue().toString(),
          plan: user.getPlan().getValue().toString(),
          lastLoginAt: undefined, // TODO: Get from user credentials
          createdAt: user.getCreatedAt(),
          updatedAt: user.getCreatedAt() // TODO: Add updatedAt to User entity
        }, "User profile retrieved successfully");

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
      this.logger.error("Error getting user profile", { error, userId: query.userId });
      
      if (error instanceof Error) {
        return AuthResultBuilder.error(
          error.message,
          "PROFILE_RETRIEVAL_ERROR",
          { originalError: error.message }
        );
      }

      return AuthResultBuilder.error(
        "An unexpected error occurred while retrieving user profile",
        "UNKNOWN_ERROR",
        { originalError: String(error) }
      );
    }
  }
} 