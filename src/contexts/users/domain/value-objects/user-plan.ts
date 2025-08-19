export enum UserPlanEnum {
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
}

export class UserPlan {
  constructor(private readonly value: UserPlanEnum) {
    this.validate();
  }

  private validate(): void {
    if (!Object.values(UserPlanEnum).includes(this.value)) {
      throw new Error(
        `Invalid user plan: ${this.value}. Must be one of: ${Object.values(UserPlanEnum).join(", ")}`,
      );
    }
  }

  static create(plan: string): UserPlan {
    const planEnum = plan.toUpperCase() as UserPlanEnum;
    return new UserPlan(planEnum);
  }

  static standard(): UserPlan {
    return new UserPlan(UserPlanEnum.STANDARD);
  }

  static premium(): UserPlan {
    return new UserPlan(UserPlanEnum.PREMIUM);
  }

  getValue(): UserPlanEnum {
    return this.value;
  }

  isStandard(): boolean {
    return this.value === UserPlanEnum.STANDARD;
  }

  isPremium(): boolean {
    return this.value === UserPlanEnum.PREMIUM;
  }

  canAccessPremiumFeatures(): boolean {
    return this.isPremium();
  }

  equals(other: UserPlan): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
