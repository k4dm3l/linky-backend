import { Logger } from "@/shared/logger/logger";

import { UserCredentials } from "@/contexts/auth/domain/entities/user-credentials";
import {
  AuthChangePasswordInvalidCurrentPasswordException,
  AuthLoginInvalidCredentialsException,
  AuthLoginUserInactiveException,
  AuthRegisterUserException,
  AuthUserNotFoundException,
} from "@/contexts/auth/domain/exceptions/auth-exceptions";
import { UserCredentialsRepository } from "@/contexts/auth/domain/repositories/user-credentials-repository";
import { Password } from "@/contexts/auth/domain/value-objects/password";
import { Transaction } from "@/contexts/users/domain/repositories/user-repository";
import { Email } from "@/contexts/users/domain/value-objects/email";

export class AuthDomainService {
  constructor(
    private readonly userCredentialsRepository: UserCredentialsRepository,
    private readonly logger: Logger,
  ) {}

  async registerUser(
    email: Email,
    password: Password,
    userId: string,
    transaction?: Transaction,
  ): Promise<UserCredentials> {
    this.logger.info("Registering user credentials", {
      email: email.getValue(),
    });

    // Check if user already exists
    const existingCredentials =
      await this.userCredentialsRepository.findByEmail(email, transaction);
    if (existingCredentials) {
      throw new AuthRegisterUserException(email.getValue());
    }

    // Create new user credentials
    const userCredentials = UserCredentials.create(email, password, userId);

    // Save to repository
    const savedCredentials = await this.userCredentialsRepository.save(
      userCredentials,
      transaction,
    );

    this.logger.info("User credentials registered successfully", {
      email: email.getValue(),
      userId,
    });

    return savedCredentials;
  }

  async authenticateUser(
    email: Email,
    plainPassword: string,
    transaction?: Transaction,
  ): Promise<UserCredentials> {
    this.logger.info("Authenticating user", { email: email.getValue() });

    // Find user credentials
    const userCredentials = await this.userCredentialsRepository.findByEmail(
      email,
      transaction,
    );
    if (!userCredentials) {
      throw new AuthLoginInvalidCredentialsException();
    }

    // Check if user is active
    if (!userCredentials.isUserActive()) {
      throw new AuthLoginUserInactiveException();
    }

    // Verify password
    const isValidPassword = userCredentials
      .getPassword()
      .compare(plainPassword);
    if (!isValidPassword) {
      throw new AuthLoginInvalidCredentialsException();
    }

    // Update last login
    const updatedCredentials = userCredentials.updateLastLogin();
    await this.userCredentialsRepository.save(updatedCredentials, transaction);

    this.logger.info("User authenticated successfully", {
      email: email.getValue(),
      userId: userCredentials.getUserId(),
    });

    return updatedCredentials;
  }

  async changePassword(
    userId: string,
    currentPlainPassword: string,
    newPassword: Password,
    transaction?: Transaction,
  ): Promise<UserCredentials> {
    this.logger.info("Changing password for user", { userId });

    // Find user credentials
    const userCredentials = await this.userCredentialsRepository.findByUserId(
      userId,
      transaction,
    );
    if (!userCredentials) {
      throw new AuthUserNotFoundException();
    }

    // Verify current password
    const isValidCurrentPassword = userCredentials
      .getPassword()
      .compare(currentPlainPassword);
    if (!isValidCurrentPassword) {
      throw new AuthChangePasswordInvalidCurrentPasswordException();
    }

    // Update password
    const updatedCredentials = userCredentials.updatePassword(newPassword);
    const savedCredentials = await this.userCredentialsRepository.save(
      updatedCredentials,
      transaction,
    );

    this.logger.info("Password changed successfully", { userId });

    return savedCredentials;
  }

  async deactivateUser(
    userId: string,
    transaction?: Transaction,
  ): Promise<UserCredentials> {
    this.logger.info("Deactivating user", { userId });

    const userCredentials = await this.userCredentialsRepository.findByUserId(
      userId,
      transaction,
    );
    if (!userCredentials) {
      throw new AuthUserNotFoundException();
    }

    const deactivatedCredentials = userCredentials.deactivate();
    const savedCredentials = await this.userCredentialsRepository.save(
      deactivatedCredentials,
      transaction,
    );

    this.logger.info("User deactivated successfully", { userId });

    return savedCredentials;
  }

  async reactivateUser(
    userId: string,
    transaction?: Transaction,
  ): Promise<UserCredentials> {
    this.logger.info("Reactivating user", { userId });

    const userCredentials = await this.userCredentialsRepository.findByUserId(
      userId,
      transaction,
    );
    if (!userCredentials) {
      throw new AuthUserNotFoundException();
    }

    const reactivatedCredentials = userCredentials.activate();
    const savedCredentials = await this.userCredentialsRepository.save(
      reactivatedCredentials,
      transaction,
    );

    this.logger.info("User reactivated successfully", { userId });

    return savedCredentials;
  }
}
