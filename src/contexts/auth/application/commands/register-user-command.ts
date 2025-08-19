// import { Password } from "@/contexts/auth/domain/value-objects/password";
// import { Email } from "@/contexts/users/domain/value-objects/email";
// import { UserName } from "@/contexts/users/domain/value-objects/user-name";
// import { UserPlan } from "@/contexts/users/domain/value-objects/user-plan";
// import { UserRole } from "@/contexts/users/domain/value-objects/user-role";

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
