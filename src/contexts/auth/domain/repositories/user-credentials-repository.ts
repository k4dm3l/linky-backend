import { UserCredentials } from "@/contexts/auth/domain/entities/user-credentials";
import { Email } from "@/contexts/users/domain/value-objects/email";
import { Transaction } from "@/contexts/users/domain/repositories/user-repository";

export interface UserCredentialsRepository {
  save(credentials: UserCredentials, transaction?: Transaction): Promise<UserCredentials>;
  findByEmail(email: Email, transaction?: Transaction): Promise<UserCredentials | null>;
  findByUserId(userId: string, transaction?: Transaction): Promise<UserCredentials | null>;
  delete(userId: string, transaction?: Transaction): Promise<void>;
  exists(email: Email, transaction?: Transaction): Promise<boolean>;
} 