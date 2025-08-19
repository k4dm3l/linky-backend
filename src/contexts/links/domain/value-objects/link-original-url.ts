import {
  LinkUrlEmptyException,
  LinkUrlInvalidException,
  LinkUrlInvalidProtocolException,
} from "@/contexts/links/domain/exceptions/link-exceptions";

export class LinkOriginalUrl {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || typeof this.value !== "string") {
      throw new LinkUrlEmptyException();
    }

    try {
      const url = new URL(this.value);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new LinkUrlInvalidProtocolException();
      }
    } catch {
      throw new LinkUrlInvalidException();
    }
  }

  static create(url: string): LinkOriginalUrl {
    return new LinkOriginalUrl(url);
  }

  getValue(): string {
    return this.value;
  }

  getDomain(): string {
    try {
      const url = new URL(this.value);
      return url.hostname;
    } catch {
      return "";
    }
  }

  getProtocol(): string {
    try {
      const url = new URL(this.value);
      return url.protocol;
    } catch {
      return "";
    }
  }

  equals(other: LinkOriginalUrl): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
