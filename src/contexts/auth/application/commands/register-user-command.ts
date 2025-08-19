import { Email } from "@/contexts/users/domain/value-objects/email";
import { Password } from "@/contexts/auth/domain/value-objects/password";
import { UserName } from "@/contexts/users/domain/value-objects/user-name";
import { UserRole } from "@/contexts/users/domain/value-objects/user-role";
import { UserPlan } from "@/contexts/users/domain/value-objects/user-plan";

export interface RegisterUserCommand {
  email: string;
  password: string;
  name: string;
  role?: string;
  plan?: string;
  profileImage?: string | null;
}

export interface RegisterUserCommandResult {
  userId: string;
  email: string;
  name: string;
  profileImage: string | null;
  isActive: boolean;
  isVerified: boolean;
  role: string;
  plan: string;
} 