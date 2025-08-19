import { LinkId } from "@/contexts/links/domain/value-objects/link-id";
import { LinkOriginalUrl } from "@/contexts/links/domain/value-objects/link-original-url";
import { LinkCode } from "@/contexts/links/domain/value-objects/link-code";
import { LinkShortUrl } from "@/contexts/links/domain/value-objects/link-short-url";

export class Link {
  constructor(
    private readonly id: LinkId,
    private readonly originalUrl: LinkOriginalUrl,
    private readonly code: LinkCode,
    private readonly shortUrl: LinkShortUrl,
    private readonly isActive: boolean,
    private readonly isDeleted: boolean,
    private readonly expirationDate: Date | null,
    private readonly isOneTimeLink: boolean,
    private readonly isOneTimeLinkUsed: boolean,
    private readonly createdAt: Date,
  ) {}

  // Business logic methods
  activate(): Link {
    return new Link(
      this.id,
      this.originalUrl,
      this.code,
      this.shortUrl,
      true,
      this.isDeleted,
      this.expirationDate,
      this.isOneTimeLink,
      this.isOneTimeLinkUsed,
      this.createdAt,
    );
  }

  deactivate(): Link {
    return new Link(
      this.id,
      this.originalUrl,
      this.code,
      this.shortUrl,
      false,
      this.isDeleted,
      this.expirationDate,
      this.isOneTimeLink,
      this.isOneTimeLinkUsed,
      this.createdAt,
    );
  }

  delete(): Link {
    return new Link(
      this.id,
      this.originalUrl,
      this.code,
      this.shortUrl,
      this.isActive,
      true,
      this.expirationDate,
      this.isOneTimeLink,
      this.isOneTimeLinkUsed,
      this.createdAt,
    );
  }

  setExpirationDate(expirationDate: Date | null): Link {
    return new Link(
      this.id,
      this.originalUrl,
      this.code,
      this.shortUrl,
      this.isActive,
      this.isDeleted,
      expirationDate,
      this.isOneTimeLink,
      this.isOneTimeLinkUsed,
      this.createdAt,
    );
  }

  setIsOneTimeLink(isOneTimeLink: boolean): Link {
    return new Link(
      this.id,
      this.originalUrl,
      this.code,
      this.shortUrl,
      this.isActive,
      this.isDeleted,
      this.expirationDate,
      isOneTimeLink,
      this.isOneTimeLinkUsed,
      this.createdAt,
    );
  }
  
  setIsOneTimeLinkUsed(isOneTimeLinkUsed: boolean): Link {
    return new Link(
      this.id,
      this.originalUrl,
      this.code,
      this.shortUrl,
      this.isActive,
      this.isDeleted,
      this.expirationDate,
      this.isOneTimeLink,
      isOneTimeLinkUsed,
      this.createdAt,
    );
  }

  // Getters - immutable access to properties
  getId(): LinkId {
    return this.id;
  }

  getOriginalUrl(): LinkOriginalUrl {
    return this.originalUrl;
  }

  getCode(): LinkCode {
    return this.code;
  }

  getShortUrl(): LinkShortUrl {
    return this.shortUrl;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getIsDeleted(): boolean {
    return this.isDeleted;
  }

  getExpirationDate(): Date | null {
    return this.expirationDate ? new Date(this.expirationDate) : null;
  }

  getIsOneTimeLink(): boolean {
    return this.isOneTimeLink;
  }

  getIsOneTimeLinkUsed(): boolean {
    return this.isOneTimeLinkUsed;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }
}