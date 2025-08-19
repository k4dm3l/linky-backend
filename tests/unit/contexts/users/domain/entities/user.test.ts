import { beforeEach, describe, expect, it } from "vitest";

import { User } from "@/contexts/users/domain/entities/user";
import { Email } from "@/contexts/users/domain/value-objects/email";
import { UserId } from "@/contexts/users/domain/value-objects/user-id";
import { UserName } from "@/contexts/users/domain/value-objects/user-name";

describe("User Entity", () => {
  let userId: UserId;
  let email: Email;
  let name: UserName;
  let createdAt: Date;

  beforeEach(() => {
    userId = UserId.generate();
    email = new Email("test@example.com");
    name = new UserName("John Doe");
    createdAt = new Date("2023-01-01T00:00:00Z");
  });

  it("should create a user with valid data", () => {
    const user = new User(userId, email, name, createdAt);

    expect(user.getId()).toBe(userId);
    expect(user.getEmail()).toBe(email);
    expect(user.getName()).toBe(name);
    expect(user.getCreatedAt()).toEqual(createdAt);
  });

  it("should update user profile", () => {
    const user = new User(userId, email, name, createdAt);
    const newName = new UserName("Jane Smith");

    const updatedUser = user.updateProfile(newName);

    expect(updatedUser.getId()).toBe(userId);
    expect(updatedUser.getEmail()).toBe(email);
    expect(updatedUser.getName()).toBe(newName);
    expect(updatedUser.getCreatedAt()).toEqual(createdAt);
  });

  it("should change user email", () => {
    const user = new User(userId, email, name, createdAt);
    const newEmail = new Email("newemail@example.com");

    const updatedUser = user.changeEmail(newEmail);

    expect(updatedUser.getId()).toBe(userId);
    expect(updatedUser.getEmail()).toBe(newEmail);
    expect(updatedUser.getName()).toBe(name);
    expect(updatedUser.getCreatedAt()).toEqual(createdAt);
  });

  it("should return a copy of createdAt to prevent mutation", () => {
    const user = new User(userId, email, name, createdAt);
    const returnedDate = user.getCreatedAt();

    // Modify the returned date
    returnedDate.setFullYear(2024);

    // Original date should remain unchanged
    expect(user.getCreatedAt()).toEqual(createdAt);
  });

  describe("canBeDeleted", () => {
    it("should allow deletion for users created more than 24 hours ago", () => {
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      const user = new User(userId, email, name, oldDate);

      expect(user.canBeDeleted()).toBe(true);
    });

    it("should not allow deletion for users created less than 24 hours ago", () => {
      const recentDate = new Date(Date.now() - 23 * 60 * 60 * 1000); // 23 hours ago
      const user = new User(userId, email, name, recentDate);

      expect(user.canBeDeleted()).toBe(false);
    });
  });
});
