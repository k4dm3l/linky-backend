import { UserCredentials } from "@/contexts/auth/domain/entities/user-credentials";
import { UserCredentialsRepository } from "@/contexts/auth/domain/repositories/user-credentials-repository";
import { Transaction } from "@/contexts/users/domain/repositories/user-repository";
import { Email } from "@/contexts/users/domain/value-objects/email";

export class InMemoryUserCredentialsRepository
  implements UserCredentialsRepository
{
  private credentials = new Map<string, UserCredentials>();
  private emailToUserId = new Map<string, string>();

  async save(
    credentials: UserCredentials,
    transaction?: Transaction,
  ): Promise<UserCredentials> {
    // For in-memory, we ignore transactions and work directly with the data
    // In a real database implementation, this would use the transaction
    const userId = credentials.getUserId();
    const email = credentials.getEmail().getValue();

    this.credentials.set(userId, credentials);
    this.emailToUserId.set(email, userId);

    return credentials;
  }

  async findByEmail(
    email: Email,
    transaction?: Transaction,
  ): Promise<UserCredentials | null> {
    // For in-memory, we ignore transactions and work directly with the data
    // In a real database implementation, this would use the transaction
    const userId = this.emailToUserId.get(email.getValue());
    if (!userId) {
      return null;
    }

    return this.credentials.get(userId) || null;
  }

  async findByUserId(
    userId: string,
    transaction?: Transaction,
  ): Promise<UserCredentials | null> {
    // For in-memory, we ignore transactions and work directly with the data
    // In a real database implementation, this would use the transaction
    return this.credentials.get(userId) || null;
  }

  async delete(userId: string, transaction?: Transaction): Promise<void> {
    // For in-memory, we ignore transactions and work directly with the data
    // In a real database implementation, this would use the transaction
    const credentials = this.credentials.get(userId);
    if (credentials) {
      const email = credentials.getEmail().getValue();
      this.emailToUserId.delete(email);
      this.credentials.delete(userId);
    }
  }

  async exists(email: Email, transaction?: Transaction): Promise<boolean> {
    // For in-memory, we ignore transactions and work directly with the data
    // In a real database implementation, this would use the transaction
    return this.emailToUserId.has(email.getValue());
  }

  // Helper method for testing
  clear(): void {
    this.credentials.clear();
    this.emailToUserId.clear();
  }
}
