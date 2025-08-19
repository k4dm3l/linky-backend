import { Email } from "@/contexts/users/domain/value-objects/email";
import { UserId } from "@/contexts/users/domain/value-objects/user-id";
import { UserName } from "@/contexts/users/domain/value-objects/user-name";
import { UserPlan } from "@/contexts/users/domain/value-objects/user-plan";
import { UserRole } from "@/contexts/users/domain/value-objects/user-role";

export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: Email,
    private readonly name: UserName,
    private readonly createdAt: Date,
    private readonly profileImage: string | null = null,
    private readonly isActive = true,
    private readonly isVerified = true,
    private readonly role: UserRole = UserRole.user(),
    private readonly plan: UserPlan = UserPlan.standard(),
  ) {}

  // Business logic methods
  updateProfile(newName: UserName): User {
    return new User(
      this.id,
      this.email,
      newName,
      this.createdAt,
      this.profileImage,
      this.isActive,
      this.isVerified,
      this.role,
      this.plan,
    );
  }

  updateProfileImage(newProfileImage: string | null): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.createdAt,
      newProfileImage,
      this.isActive,
      this.isVerified,
      this.role,
      this.plan,
    );
  }

  changeEmail(newEmail: Email): User {
    return new User(
      this.id,
      newEmail,
      this.name,
      this.createdAt,
      this.profileImage,
      this.isActive,
      this.isVerified,
      this.role,
      this.plan,
    );
  }

  activate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.createdAt,
      this.profileImage,
      true,
      this.isVerified,
      this.role,
      this.plan,
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.createdAt,
      this.profileImage,
      false,
      this.isVerified,
      this.role,
      this.plan,
    );
  }

  verify(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.createdAt,
      this.profileImage,
      this.isActive,
      true,
      this.role,
      this.plan,
    );
  }

  unverify(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.createdAt,
      this.profileImage,
      this.isActive,
      false,
      this.role,
      this.plan,
    );
  }

  changeRole(newRole: UserRole): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.createdAt,
      this.profileImage,
      this.isActive,
      this.isVerified,
      newRole,
      this.plan,
    );
  }

  upgradeToPremium(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.createdAt,
      this.profileImage,
      this.isActive,
      this.isVerified,
      this.role,
      UserPlan.premium(),
    );
  }

  downgradeToStandard(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.createdAt,
      this.profileImage,
      this.isActive,
      this.isVerified,
      this.role,
      UserPlan.standard(),
    );
  }

  changePlan(newPlan: UserPlan): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.createdAt,
      this.profileImage,
      this.isActive,
      this.isVerified,
      this.role,
      newPlan,
    );
  }

  // Validation methods
  canBeDeleted(): boolean {
    // Business rule: Users can only be deleted if they were created more than 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.createdAt < twentyFourHoursAgo;
  }

  canAccessAdminFeatures(): boolean {
    return this.isActive && this.isVerified && this.role.isAdmin();
  }

  canAccessPremiumFeatures(): boolean {
    return (
      this.isActive && this.isVerified && this.plan.canAccessPremiumFeatures()
    );
  }

  // Getters - immutable access to properties
  getId(): UserId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getName(): UserName {
    return this.name;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getProfileImage(): string | null {
    return this.profileImage;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getIsVerified(): boolean {
    return this.isVerified;
  }

  getRole(): UserRole {
    return this.role;
  }

  getPlan(): UserPlan {
    return this.plan;
  }
}
