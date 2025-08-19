import { Email } from "@/contexts/users/domain/value-objects/email";
import { Password } from "../value-objects/password";

export class UserCredentials {
  constructor(
    private readonly email: Email,
    private readonly password: Password,
    private readonly userId: string,
    private readonly isActive: boolean = true,
    private readonly lastLoginAt?: Date,
    private readonly createdAt: Date = new Date(),
    private readonly updatedAt: Date = new Date()
  ) {}

  static create(
    email: Email,
    password: Password,
    userId: string
  ): UserCredentials {
    return new UserCredentials(email, password, userId);
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): Password {
    return this.password;
  }

  getUserId(): string {
    return this.userId;
  }

  isUserActive(): boolean {
    return this.isActive;
  }

  getLastLoginAt(): Date | undefined {
    return this.lastLoginAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updatePassword(newPassword: Password): UserCredentials {
    return new UserCredentials(
      this.email,
      newPassword,
      this.userId,
      this.isActive,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }

  updateLastLogin(): UserCredentials {
    return new UserCredentials(
      this.email,
      this.password,
      this.userId,
      this.isActive,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  deactivate(): UserCredentials {
    return new UserCredentials(
      this.email,
      this.password,
      this.userId,
      false,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }

  activate(): UserCredentials {
    return new UserCredentials(
      this.email,
      this.password,
      this.userId,
      true,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }
} 