import { describe, it, expect } from "vitest";
import { Password } from "@/contexts/auth/domain/value-objects/password";

describe("Password", () => {
  describe("create", () => {
    it("should create a password with valid input", () => {
      const password = Password.create("ValidPass123");
      
      expect(password.getHashedValue()).toBeDefined();
      expect(password.getHashedValue()).not.toBe("ValidPass123");
      expect(password.isHashedPassword()).toBe(true);
    });

    it("should throw error for empty password", () => {
      expect(() => Password.create("")).toThrow("Password cannot be empty");
      expect(() => Password.create("   ")).toThrow("Password cannot be empty");
    });

    it("should throw error for password too short", () => {
      expect(() => Password.create("Short1")).toThrow("Password must be at least 8 characters long");
    });

    it("should throw error for password too long", () => {
      const longPassword = "A".repeat(129) + "1";
      expect(() => Password.create(longPassword)).toThrow("Password cannot exceed 128 characters");
    });

    it("should throw error for password without uppercase", () => {
      expect(() => Password.create("lowercase123")).toThrow("Password must contain at least one uppercase letter, one lowercase letter, and one number");
    });

    it("should throw error for password without lowercase", () => {
      expect(() => Password.create("UPPERCASE123")).toThrow("Password must contain at least one uppercase letter, one lowercase letter, and one number");
    });

    it("should throw error for password without numbers", () => {
      expect(() => Password.create("NoNumbers")).toThrow("Password must contain at least one uppercase letter, one lowercase letter, and one number");
    });
  });

  describe("fromHashed", () => {
    it("should create password from hashed value", () => {
      const hashedValue = "$2a$12$hashedpasswordvalue";
      const password = Password.fromHashed(hashedValue);
      
      expect(password.getHashedValue()).toBe(hashedValue);
      expect(password.isHashedPassword()).toBe(true);
    });

    it("should throw error for empty hashed password", () => {
      expect(() => Password.fromHashed("")).toThrow("Hashed password cannot be empty");
      expect(() => Password.fromHashed("   ")).toThrow("Hashed password cannot be empty");
    });
  });

  describe("compare", () => {
    it("should return true for matching password", () => {
      const plainPassword = "ValidPass123";
      const password = Password.create(plainPassword);
      
      expect(password.compare(plainPassword)).toBe(true);
    });

    it("should return false for non-matching password", () => {
      const password = Password.create("ValidPass123");
      
      expect(password.compare("WrongPassword123")).toBe(false);
    });
  });
}); 