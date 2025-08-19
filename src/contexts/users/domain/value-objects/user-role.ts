export enum UserRoleEnum {
  ADMIN = "ADMIN",
  USER = "USER"
}

export class UserRole {
  constructor(private readonly value: UserRoleEnum) {
    this.validate();
  }

  private validate(): void {
    if (!Object.values(UserRoleEnum).includes(this.value)) {
      throw new Error(`Invalid user role: ${this.value}. Must be one of: ${Object.values(UserRoleEnum).join(", ")}`);
    }
  }

  static create(role: string): UserRole {
    const roleEnum = role.toUpperCase() as UserRoleEnum;
    return new UserRole(roleEnum);
  }

  static user(): UserRole {
    return new UserRole(UserRoleEnum.USER);
  }

  static admin(): UserRole {
    return new UserRole(UserRoleEnum.ADMIN);
  }

  getValue(): UserRoleEnum {
    return this.value;
  }

  isAdmin(): boolean {
    return this.value === UserRoleEnum.ADMIN;
  }

  isUser(): boolean {
    return this.value === UserRoleEnum.USER;
  }

  equals(other: UserRole): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
} 