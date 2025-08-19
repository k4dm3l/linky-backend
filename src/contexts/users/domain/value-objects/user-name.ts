export class UserName {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error("User name cannot be empty");
    }

    const trimmedValue = this.value.trim();

    if (trimmedValue.length < 2) {
      throw new Error("User name must be at least 2 characters long");
    }

    if (trimmedValue.length > 50) {
      throw new Error("User name cannot be longer than 50 characters");
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!nameRegex.test(trimmedValue)) {
      throw new Error(
        "User name can only contain letters, spaces, hyphens, and apostrophes",
      );
    }

    // Check for consecutive spaces
    if (trimmedValue.includes("  ")) {
      throw new Error("User name cannot contain consecutive spaces");
    }
  }

  getValue(): string {
    return this.value.trim();
  }

  getFirstName(): string {
    return this.getValue().split(" ")[0] || "";
  }

  getLastName(): string {
    const parts = this.getValue().split(" ");
    return parts.slice(1).join(" ") || "";
  }

  getInitials(): string {
    return this.getValue()
      .split(" ")
      .map(part => part.charAt(0).toUpperCase())
      .join("");
  }

  equals(other: UserName): boolean {
    return this.getValue() === other.getValue();
  }

  toString(): string {
    return this.getValue();
  }
}
