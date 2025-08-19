import bcrypt from "bcryptjs";

export class Password {
  private readonly hashedValue: string;
  private readonly isHashed: boolean;

  private constructor(value: string, isHashed: boolean = false) {
    this.hashedValue = value;
    this.isHashed = isHashed;
  }

  static create(plainPassword: string): Password {
    if (!plainPassword || plainPassword.trim().length === 0) {
      throw new Error("Password cannot be empty");
    }

    if (plainPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (plainPassword.length > 128) {
      throw new Error("Password cannot exceed 128 characters");
    }

    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUpperCase = /[A-Z]/.test(plainPassword);
    const hasLowerCase = /[a-z]/.test(plainPassword);
    const hasNumbers = /\d/.test(plainPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      throw new Error("Password must contain at least one uppercase letter, one lowercase letter, and one number");
    }

    const hashedPassword = bcrypt.hashSync(plainPassword, 12);
    return new Password(hashedPassword, true);
  }

  static fromHashed(hashedPassword: string): Password {
    if (!hashedPassword || hashedPassword.trim().length === 0) {
      throw new Error("Hashed password cannot be empty");
    }

    return new Password(hashedPassword, true);
  }

  compare(plainPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, this.hashedValue);
  }

  getHashedValue(): string {
    return this.hashedValue;
  }

  isHashedPassword(): boolean {
    return this.isHashed;
  }
} 