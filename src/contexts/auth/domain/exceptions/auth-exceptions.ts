export class AuthRegisterUserException extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = "AuthRegisterUserException";
  }
}

export class AuthLoginInvalidCredentialsException extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "AuthLoginInvalidCredentialsException";
  }
}

export class AuthLoginUserInactiveException extends Error {
  constructor() {
    super("User account is deactivated");
    this.name = "AuthLoginUserInactiveException";
  }
}

export class AuthUserNotFoundException extends Error {
  constructor() {
    super("User not found");
    this.name = "AuthUserNotFoundException";
  }
}

export class AuthChangePasswordInvalidCurrentPasswordException extends Error {
  constructor() {
    super("Current password is incorrect");
    this.name = "AuthChangePasswordInvalidCurrentPasswordException";
  }
}
