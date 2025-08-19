import { User } from "@/contexts/users/domain/entities/user";
import {
  UserAlreadyExistsError,
  UserCannotBeDeletedError,
  UserNotFoundError,
} from "@/contexts/users/domain/exceptions/user-exceptions";
import { UserRepository } from "@/contexts/users/domain/repositories/user-repository";
import { Email } from "@/contexts/users/domain/value-objects/email";
import { UserId } from "@/contexts/users/domain/value-objects/user-id";
import { UserName } from "@/contexts/users/domain/value-objects/user-name";

export class UserDomainService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(email: Email, name: UserName): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError(email.getValue());
    }

    // Create new user with generated ID
    const user = new User(UserId.generate(), email, name, new Date());

    // Save to repository
    await this.userRepository.save(user);
    return user;
  }

  async updateUserProfile(userId: UserId, newName: UserName): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId.getValue());
    }

    const updatedUser = user.updateProfile(newName);
    await this.userRepository.save(updatedUser);
    return updatedUser;
  }

  async changeUserEmail(userId: UserId, newEmail: Email): Promise<User> {
    // Check if new email is already taken by another user
    const existingUser = await this.userRepository.findByEmail(newEmail);
    if (existingUser && !existingUser.getId().equals(userId)) {
      throw new UserAlreadyExistsError(newEmail.getValue());
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId.getValue());
    }

    const updatedUser = user.changeEmail(newEmail);
    await this.userRepository.save(updatedUser);
    return updatedUser;
  }

  async deleteUser(userId: UserId): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId.getValue());
    }

    // Check business rule: users can only be deleted after 24 hours
    if (!user.canBeDeleted()) {
      throw new UserCannotBeDeletedError(userId.getValue());
    }

    await this.userRepository.delete(userId);
  }

  async getUserById(userId: UserId): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId.getValue());
    }
    return user;
  }

  async getUserByEmail(email: Email): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError(email.getValue());
    }
    return user;
  }

  // Business logic for user statistics
  async getUserStatistics(): Promise<{
    totalUsers: number;
    usersCreatedToday: number;
    usersCreatedThisWeek: number;
    usersCreatedThisMonth: number;
  }> {
    const allUsers = await this.userRepository.findAll();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      totalUsers: allUsers.length,
      usersCreatedToday: allUsers.filter(user => user.getCreatedAt() >= today)
        .length,
      usersCreatedThisWeek: allUsers.filter(
        user => user.getCreatedAt() >= weekAgo,
      ).length,
      usersCreatedThisMonth: allUsers.filter(
        user => user.getCreatedAt() >= monthAgo,
      ).length,
    };
  }
}
