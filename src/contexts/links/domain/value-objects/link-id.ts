import { LinkIdEmptyException } from "@/contexts/links/domain/exceptions/link-exceptions";

export class LinkId {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== "string") {
      throw new LinkIdEmptyException();
    }
  }

  static create(id: string): LinkId {
    return new LinkId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: LinkId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
} 