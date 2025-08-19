export enum AuditActionEnum {
  CREATED = "CREATED",
  ACTIVATED = "ACTIVATED",
  DEACTIVATED = "DEACTIVATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}

export class AuditAction {
  constructor(private readonly value: AuditActionEnum) {
    this.validate();
  }

  private validate(): void {
    if (!Object.values(AuditActionEnum).includes(this.value)) {
      throw new Error(
        `Invalid audit action: ${this.value}. Must be one of: ${Object.values(AuditActionEnum).join(", ")}`,
      );
    }
  }

  static create(action: string): AuditAction {
    const actionEnum = action.toUpperCase() as AuditActionEnum;
    return new AuditAction(actionEnum);
  }

  static created(): AuditAction {
    return new AuditAction(AuditActionEnum.CREATED);
  }

  static activated(): AuditAction {
    return new AuditAction(AuditActionEnum.ACTIVATED);
  }

  static deactivated(): AuditAction {
    return new AuditAction(AuditActionEnum.DEACTIVATED);
  }

  static updated(): AuditAction {
    return new AuditAction(AuditActionEnum.UPDATED);
  }

  static deleted(): AuditAction {
    return new AuditAction(AuditActionEnum.DELETED);
  }

  getValue(): AuditActionEnum {
    return this.value;
  }

  equals(other: AuditAction): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
