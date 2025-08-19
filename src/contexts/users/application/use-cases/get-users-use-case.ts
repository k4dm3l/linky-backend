import { UserRepository } from "../../domain/repositories/user-repository";
import { GetUsersQuery } from "../queries/get-users-query";
import { GetUsersResult } from "../results/application-result";
import { UserDto, UserListDto } from "../dtos/user-dto";
import { Logger } from "@/shared/logger/logger";

export class GetUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger
  ) {}

  async execute(query: GetUsersQuery): Promise<GetUsersResult> {
    try {
      this.logger.info("Getting users", { 
        offset: query.offset, 
        limit: query.limit,
        name: query.name,
        domain: query.domain
      });

      // Set default pagination values
      const offset = query.offset || 0;
      const limit = Math.min(query.limit || 10, 100); // Max 100 users per page

      let users: any[] = [];
      let total = 0;

      // Apply filters and get users
      if (query.name) {
        users = await this.userRepository.findByName(query.name);
        total = users.length;
      } else if (query.domain) {
        users = await this.userRepository.findByDomain(query.domain);
        total = users.length;
      } else {
        const result = await this.userRepository.findWithPagination(offset, limit);
        users = result.users;
        total = result.total;
      }

      // Map to DTOs
      const userDtos: UserDto[] = users.map(user => ({
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName().getValue(),
        createdAt: user.getCreatedAt(),
        profileImage: user.getProfileImage(),
        isActive: user.getIsActive(),
        isVerified: user.getIsVerified(),
        role: user.getRole().getValue(),
        plan: user.getPlan().getValue()
      }));

      const userListDto: UserListDto = {
        users: userDtos,
        total,
        hasMore: offset + limit < total,
        offset,
        limit
      };

      this.logger.info("Users retrieved successfully", { 
        count: userDtos.length,
        total,
        hasMore: userListDto.hasMore
      });

      return {
        success: true,
        data: userListDto
      };

    } catch (error) {
      this.logger.error("Failed to get users", { 
        error: error instanceof Error ? error.message : "Unknown error",
        query 
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        errorCode: "INTERNAL_ERROR"
      };
    }
  }
} 