export class JwtToken {
  private readonly value: string;

  constructor(token: string) {
    if (!token || token.trim().length === 0) {
      throw new Error("JWT token cannot be empty");
    }

    // Basic JWT format validation (header.payload.signature)
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT token format");
    }

    this.value = token;
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: JwtToken): boolean {
    return this.value === other.value;
  }
}
