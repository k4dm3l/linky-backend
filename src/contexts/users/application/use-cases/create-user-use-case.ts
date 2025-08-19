import { Logger } from "@/shared/logger/logger";

import { CreateUserCommand } from "@/contexts/users/application/commands/create-user-command";
import { UserDto } from "@/contexts/users/application/dtos/user-dto";
import { CreateUserResult } from "@/contexts/users/application/results/application-result";
import { UserDomainService } from "@/contexts/users/domain/services/user-domain-service";
import { Email } from "@/contexts/users/domain/value-objects/email";
import { UserName } from "@/contexts/users/domain/value-objects/user-name";

import { InvalidUserDataError } from "@/contexts/users/domain/exceptions/user-exceptions";

export class CreateUserUseCase {
  constructor(
    private readonly userDomainService: UserDomainService,
    private readonly logger: Logger,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    try {
      this.logger.info("Creating user", {
        email: command.email,
        name: command.name,
      });

      // Validate individual fields first
      if (!command.email || command.email.trim() === "") {
        return {
          success: false,
          error: "Email cannot be empty",
          errorCode: "VALIDATION_ERROR",
        };
      }

      if (!command.name || command.name.trim() === "") {
        return {
          success: false,
          error: "User name cannot be empty",
          errorCode: "VALIDATION_ERROR",
        };
      }

      // Create value objects (this will validate the data)
      let email: Email;
      let name: UserName;

      try {
        email = new Email(command.email);
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Invalid email format",
          errorCode: "VALIDATION_ERROR",
        };
      }

      try {
        name = new UserName(command.name);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Invalid name format",
          errorCode: "VALIDATION_ERROR",
        };
      }

      // Execute domain logic
      const user = await this.userDomainService.createUser(email, name);

      // Map to DTO
      const userDto: UserDto = {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName().getValue(),
        profileImage: user.getProfileImage() ?? null,
        isActive: user.getIsActive(),
        isVerified: user.getIsVerified(),
        role: user.getRole().getValue(),
        plan: user.getPlan().getValue(),
        createdAt: user.getCreatedAt(),
      };

      this.logger.info("User created successfully", { userId: userDto.id });

      return {
        success: true,
        data: userDto,
      };
    } catch (error) {
      this.logger.error("Failed to create user", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: command.email,
      });

      if (error instanceof InvalidUserDataError) {
        return {
          success: false,
          error: error.message,
          errorCode: "VALIDATION_ERROR",
        };
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        errorCode: "INTERNAL_ERROR",
      };
    }
  }
}
