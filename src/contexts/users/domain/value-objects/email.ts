export class Email {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error("Email cannot be empty");
    }

    if (this.value.length > 254) {
      throw new Error("Email cannot be longer than 254 characters");
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new Error("Email must be in a valid format");
    }

    // Check for common invalid patterns
    if (this.value.includes("..") || this.value.includes("@@")) {
      throw new Error("Email contains invalid characters");
    }
  }

  getValue(): string {
    return this.value.toLowerCase(); // Normalize to lowercase
  }

  getDomain(): string {
    return this.value.split("@")[1]?.toLowerCase() || "";
  }

  equals(other: Email): boolean {
    return this.getValue() === other.getValue();
  }

  toString(): string {
    return this.getValue();
  }
}
