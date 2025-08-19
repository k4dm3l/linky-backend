import { Link } from "@/contexts/links/domain/entities/link";
import { LinkRepository } from "@/contexts/links/domain/repositories/link-repository";
import { LinkCode } from "@/contexts/links/domain/value-objects/link-code";
import { LinkId } from "@/contexts/links/domain/value-objects/link-id";
import { LinkOriginalUrl } from "@/contexts/links/domain/value-objects/link-original-url";
import { LinkShortUrl } from "@/contexts/links/domain/value-objects/link-short-url";

export class InMemoryLinkRepository implements LinkRepository {
  private links = new Map<string, Link>();
  private transactionActive = false;
  private transactionLinks: Map<string, Link> | null = null;

  async findById(id: LinkId): Promise<Link | null> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    return links.get(id.getValue()) || null;
  }

  async findByCode(code: LinkCode): Promise<Link | null> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    const codeValue = code.getValue();

    for (const link of links.values()) {
      if (link.getCode().getValue() === codeValue) {
        return link;
      }
    }
    return null;
  }

  async findByShortUrl(shortUrl: LinkShortUrl): Promise<Link | null> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    const shortUrlValue = shortUrl.getValue();

    for (const link of links.values()) {
      if (link.getShortUrl().getValue() === shortUrlValue) {
        return link;
      }
    }
    return null;
  }

  async save(link: Link): Promise<void> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    links.set(link.getId().getValue(), link);
  }

  async delete(id: LinkId): Promise<void> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    links.delete(id.getValue());
  }

  async deactivate(id: LinkId): Promise<void> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    const link = links.get(id.getValue());
    if (link) {
      link.deactivate();
      links.set(id.getValue(), link);
    }
  }

  async activate(id: LinkId): Promise<void> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    const link = links.get(id.getValue());
    if (link) {
      link.activate();
      links.set(id.getValue(), link);
    }
  }

  async updateExpirationDate(
    id: LinkId,
    expirationDate: Date | null,
  ): Promise<void> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    const link = links.get(id.getValue());
    if (link) {
      link.setExpirationDate(expirationDate);
      links.set(id.getValue(), link);
    }
  }

  async updateIsOneTimeLink(id: LinkId, isOneTimeLink: boolean): Promise<void> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    const link = links.get(id.getValue());
    if (link) {
      link.setIsOneTimeLink(isOneTimeLink);
      links.set(id.getValue(), link);
    }
  }

  async updateIsOneTimeLinkUsed(
    id: LinkId,
    isOneTimeLinkUsed: boolean,
  ): Promise<void> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    const link = links.get(id.getValue());
    if (link) {
      link.setIsOneTimeLinkUsed(isOneTimeLinkUsed);
      links.set(id.getValue(), link);
    }
  }

  async findAll(): Promise<Link[]> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    return [...links.values()];
  }

  async findByOriginalUrl(originalUrl: LinkOriginalUrl): Promise<Link[]> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    const originalUrlValue = originalUrl.getValue();
    const result: Link[] = [];

    for (const link of links.values()) {
      if (link.getOriginalUrl().getValue() === originalUrlValue) {
        result.push(link);
      }
    }
    return result;
  }

  async findWithPagination(
    offset: number,
    limit: number,
  ): Promise<{
    links: Link[];
    total: number;
    hasMore: boolean;
  }> {
    const links = this.transactionActive ? this.transactionLinks! : this.links;
    const allLinks = [...links.values()];
    const total = allLinks.length;
    const hasMore = total > offset + limit;
    const paginatedLinks = allLinks.slice(offset, offset + limit);
    return { links: paginatedLinks, total, hasMore };
  }

  async beginTransaction(): Promise<void> {
    this.transactionActive = true;
    this.transactionLinks = new Map();
  }

  async commitTransaction(): Promise<void> {
    this.transactionActive = false;
    this.transactionLinks = null;
  }

  async rollbackTransaction(): Promise<void> {
    this.transactionActive = false;
    this.transactionLinks = null;
  }

  // Helper method for testing
  clear(): void {
    this.links.clear();
    if (this.transactionLinks) {
      this.transactionLinks.clear();
    }
  }
}
