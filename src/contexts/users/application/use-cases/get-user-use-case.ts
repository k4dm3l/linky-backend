import { UserId } from "../../domain/value-objects/user-id";
import { UserDomainService } from "../../domain/services/user-domain-service";
import { GetUserQuery } from "../queries/get-user-query";
import { GetUserResult } from "../results/application-result";
import { UserDto } from "../dtos/user-dto";
import { Logger } from "@/shared/logger/logger";

export class GetUserUseCase {
  constructor(
    private readonly userDomainService: UserDomainService,
    private readonly logger: Logger
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserResult> {
    try {
      this.logger.info("Getting user", { userId: query.userId });

      // Validate input
      if (!query.userId) {
        return {
          success: false,
          error: "User ID is required",
          errorCode: "VALIDATION_ERROR"
        };
      }

      // Create value object
      const userId = new UserId(query.userId);

      // Execute domain logic
      const user = await this.userDomainService.getUserById(userId);

      // Map to DTO
      const userDto: UserDto = {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName().getValue(),
        createdAt: user.getCreatedAt(),
        profileImage: user.getProfileImage(),
        isActive: user.getIsActive(),
        isVerified: user.getIsVerified(),
        role: user.getRole().getValue(),
        plan: user.getPlan().getValue()
      };

      this.logger.info("User retrieved successfully", { userId: userDto.id });

      return {
        success: true,
        data: userDto
      };

    } catch (error) {
      this.logger.error("Failed to get user", { 
        error: error instanceof Error ? error.message : "Unknown error",
        userId: query.userId 
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        errorCode: "INTERNAL_ERROR"
      };
    }
  }
} 