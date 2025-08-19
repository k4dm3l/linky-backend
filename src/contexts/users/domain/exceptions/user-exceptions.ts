export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = "UserAlreadyExistsError";
  }
}

export class UserNotFoundError extends Error {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
    this.name = "UserNotFoundError";
  }
}

export class UserCannotBeDeletedError extends Error {
  constructor(userId: string) {
    super(`User ${userId} cannot be deleted (created less than 24 hours ago)`);
    this.name = "UserCannotBeDeletedError";
  }
}

export class InvalidUserDataError extends Error {
  constructor(message: string) {
    super(`Invalid user data: ${message}`);
    this.name = "InvalidUserDataError";
  }
}
