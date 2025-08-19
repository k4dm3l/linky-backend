import { Link } from "@/contexts/links/domain/entities/link";
import { LinkId } from "@/contexts/links/domain/value-objects/link-id";
import { LinkOriginalUrl } from "@/contexts/links/domain/value-objects/link-original-url";
import { LinkCode } from "@/contexts/links/domain/value-objects/link-code";
import { LinkShortUrl } from "@/contexts/links/domain/value-objects/link-short-url";

export interface LinkRepository {
  findById(id: LinkId): Promise<Link | null>;
  findByCode(code: LinkCode): Promise<Link | null>;
  findByShortUrl(shortUrl: LinkShortUrl): Promise<Link | null>;
  save(link: Link): Promise<void>;
  delete(id: LinkId): Promise<void>;
  deactivate(id: LinkId): Promise<void>;
  activate(id: LinkId): Promise<void>;
  updateExpirationDate(id: LinkId, expirationDate: Date | null): Promise<void>;
  updateIsOneTimeLink(id: LinkId, isOneTimeLink: boolean): Promise<void>;
  updateIsOneTimeLinkUsed(id: LinkId, isOneTimeLinkUsed: boolean): Promise<void>;

  // Query operations
  findAll(): Promise<Link[]>;
  findByOriginalUrl(originalUrl: LinkOriginalUrl): Promise<Link[]>;

  // Pagination support
  findWithPagination(offset: number, limit: number): Promise<{
    links: Link[];
    total: number;
    hasMore: boolean;
  }>;

  // Transaction support
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
}