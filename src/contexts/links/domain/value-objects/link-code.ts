import { LinkCodeEmptyException, LinkCodeInvalidCharactersException, LinkCodeInvalidLengthException } from "@/contexts/links/domain/exceptions/link-exceptions";

export class LinkCode {
  private static readonly CODE_LENGTH = 12;
  private static readonly ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== "string") {
      throw new LinkCodeEmptyException();
    }

    if (this.value.length > LinkCode.CODE_LENGTH) {
      throw new LinkCodeInvalidLengthException(LinkCode.CODE_LENGTH);
    }

    if (!/^[A-Z0-9]+$/.test(this.value)) {
      throw new LinkCodeInvalidCharactersException();
    }
  }

  static create(code: string): LinkCode {
    return new LinkCode(code.toUpperCase());
  }

  static generate(): LinkCode {
    let code = "";
    for (let i = 0; i < LinkCode.CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * LinkCode.ALPHANUMERIC_CHARS.length);
      code += LinkCode.ALPHANUMERIC_CHARS[randomIndex];
    }
    return new LinkCode(code);
  }

  static generateWithLength(length: number): LinkCode {
    if (length > LinkCode.CODE_LENGTH) {
      throw new LinkCodeInvalidLengthException(LinkCode.CODE_LENGTH);
    }

    let code = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * LinkCode.ALPHANUMERIC_CHARS.length);
      code += LinkCode.ALPHANUMERIC_CHARS[randomIndex];
    }
    return new LinkCode(code);
  }

  getValue(): string {
    return this.value;
  }

  getLength(): number {
    return this.value.length;
  }

  equals(other: LinkCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
} 