import { User } from "@/contexts/users/domain/entities/user";
import { Email } from "@/contexts/users/domain/value-objects/email";
import { UserId } from "@/contexts/users/domain/value-objects/user-id";

// Generic transaction interface that works for both SQL and NoSQL
export interface Transaction {
  // For SQL databases (Knex, TypeORM, etc.)
  commit(): Promise<void>;
  rollback(): Promise<void>;

  // For NoSQL databases (MongoDB, etc.)
  abort(): Promise<void>;

  // Generic transaction ID for tracking
  getId(): string;
}

// Repository interface without transaction methods
export interface UserRepository {
  // Basic CRUD operations
  findById(id: UserId, transaction?: Transaction): Promise<User | null>;
  findByEmail(email: Email, transaction?: Transaction): Promise<User | null>;
  save(user: User, transaction?: Transaction): Promise<void>;
  delete(id: UserId, transaction?: Transaction): Promise<void>;

  // Query operations
  findAll(transaction?: Transaction): Promise<User[]>;
  findByName(name: string, transaction?: Transaction): Promise<User[]>;
  findByDomain(domain: string, transaction?: Transaction): Promise<User[]>;

  // Pagination support
  findWithPagination(
    offset: number,
    limit: number,
    transaction?: Transaction,
  ): Promise<{
    users: User[];
    total: number;
    hasMore: boolean;
  }>;

  // Bulk operations
  saveMany(users: User[], transaction?: Transaction): Promise<void>;
  deleteMany(ids: UserId[], transaction?: Transaction): Promise<void>;
}
