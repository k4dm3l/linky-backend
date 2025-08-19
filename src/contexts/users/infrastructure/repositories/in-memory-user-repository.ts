import { User } from "@/contexts/users/domain/entities/user";
import {
  Transaction,
  UserRepository,
} from "@/contexts/users/domain/repositories/user-repository";
import { Email } from "@/contexts/users/domain/value-objects/email";
import { UserId } from "@/contexts/users/domain/value-objects/user-id";

export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async findById(id: UserId, transaction?: Transaction): Promise<User | null> {
    // For in-memory, we ignore transactions and work directly with the data
    // In a real database implementation, this would use the transaction
    return this.users.get(id.getValue()) || null;
  }

  async findByEmail(
    email: Email,
    transaction?: Transaction,
  ): Promise<User | null> {
    const emailValue = email.getValue();

    for (const user of this.users.values()) {
      if (user.getEmail().getValue() === emailValue) {
        return user;
      }
    }

    return null;
  }

  async save(user: User, transaction?: Transaction): Promise<void> {
    // For in-memory, we ignore transactions and work directly with the data
    // In a real database implementation, this would use the transaction
    this.users.set(user.getId().getValue(), user);
  }

  async delete(id: UserId, transaction?: Transaction): Promise<void> {
    // For in-memory, we ignore transactions and work directly with the data
    // In a real database implementation, this would use the transaction
    this.users.delete(id.getValue());
  }

  async findAll(transaction?: Transaction): Promise<User[]> {
    // For in-memory, we ignore transactions and work directly with the data
    // In a real database implementation, this would use the transaction
    return [...this.users.values()];
  }

  async findByName(name: string, transaction?: Transaction): Promise<User[]> {
    const normalizedName = name.toLowerCase();

    return [...this.users.values()].filter(user =>
      user.getName().getValue().toLowerCase().includes(normalizedName),
    );
  }

  async findByDomain(
    domain: string,
    transaction?: Transaction,
  ): Promise<User[]> {
    const normalizedDomain = domain.toLowerCase();

    return [...this.users.values()].filter(
      user => user.getEmail().getDomain() === normalizedDomain,
    );
  }

  async findWithPagination(
    offset: number,
    limit: number,
    transaction?: Transaction,
  ): Promise<{
    users: User[];
    total: number;
    hasMore: boolean;
  }> {
    const allUsers = [...this.users.values()];
    const total = allUsers.length;

    // Sort by creation date (newest first)
    const sortedUsers = allUsers.sort(
      (a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime(),
    );

    const paginatedUsers = sortedUsers.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      users: paginatedUsers,
      total,
      hasMore,
    };
  }

  async saveMany(users: User[], transaction?: Transaction): Promise<void> {
    for (const user of users) {
      await this.save(user, transaction);
    }
  }

  async deleteMany(ids: UserId[], transaction?: Transaction): Promise<void> {
    for (const id of ids) {
      await this.delete(id, transaction);
    }
  }

  // Helper method for testing
  clear(): void {
    this.users.clear();
  }
}
