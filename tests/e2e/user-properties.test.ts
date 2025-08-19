import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { Server } from "@/app/server";

describe("User Properties E2E", () => {
  let server: Server;
  let app: any;

  beforeAll(async () => {
    server = new Server();
    await server.start();
    app = server.getHttpServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("User Registration with New Properties", () => {
    it("should register a user with default values when optional fields are not provided", async () => {
      const userData = {
        email: "default@example.com",
        password: "SecurePass123",
        name: "Default User",
      };

      const registerResponse = await request(app)
        .post("/api/v1/auth/sign-up")
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toMatchObject({
        data: {
          userId: expect.any(String),
          email: "default@example.com",
          name: "Default User",
          profileImage: null,
          isActive: true,
          isVerified: false,
          role: "USER",
          plan: "STANDARD",
        },
        message: "User registered successfully",
      });
    });

    it("should register a user with custom values for all optional fields", async () => {
      const userData = {
        email: "custom@example.com",
        password: "SecurePass123",
        name: "Custom User",
        profileImage: "https://example.com/avatar.jpg",
        isActive: true,
        isVerified: false,
        role: "ADMIN",
        plan: "PREMIUM",
      };

      const registerResponse = await request(app)
        .post("/api/v1/auth/sign-up")
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toMatchObject({
        data: {
          userId: expect.any(String),
          email: "custom@example.com",
          name: "Custom User",
          profileImage: "https://example.com/avatar.jpg",
          isActive: true,
          isVerified: false,
          role: "ADMIN",
          plan: "PREMIUM",
        },
        message: "User registered successfully",
      });
    });

    it("should register a user with partial custom values", async () => {
      const userData = {
        email: "partial@example.com",
        password: "SecurePass123",
        name: "Partial User",
        profileImage: "https://cloudinary.com/avatar.png",
        role: "USER",
        plan: "PREMIUM",
        // isActive and isVerified will use defaults (true)
      };

      const registerResponse = await request(app)
        .post("/api/v1/auth/sign-up")
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toMatchObject({
        data: {
          userId: expect.any(String),
          email: "partial@example.com",
          name: "Partial User",
          profileImage: "https://cloudinary.com/avatar.png",
          isActive: true,
          isVerified: false,
          role: "USER",
          plan: "PREMIUM",
        },
        message: "User registered successfully",
      });
    });

    it("should reject registration with invalid profile image URL", async () => {
      const userData = {
        email: "invalid@example.com",
        password: "SecurePass123",
        name: "Invalid User",
        profileImage: "not-a-valid-url",
      };

      const registerResponse = await request(app)
        .post("/api/v1/auth/sign-up")
        .send(userData)
        .expect(422);

      expect(registerResponse.body).toMatchObject({
        error: "Validation Error",
        message: "Request validation failed",
        errorCode: "VALIDATION_ERROR",
        details: expect.arrayContaining([
          expect.objectContaining({
            field: "profileImage",
            type: "string.uri",
          }),
        ]),
      });
    });

    it("should reject registration with invalid role", async () => {
      const userData = {
        email: "invalid@example.com",
        password: "SecurePass123",
        name: "Invalid User",
        role: "SUPER_ADMIN", // Invalid role
      };

      const registerResponse = await request(app)
        .post("/api/v1/auth/sign-up")
        .send(userData)
        .expect(422);

      expect(registerResponse.body).toMatchObject({
        error: "Validation Error",
        message: "Request validation failed",
        errorCode: "VALIDATION_ERROR",
        details: expect.arrayContaining([
          expect.objectContaining({
            field: "role",
            type: "any.only",
          }),
        ]),
      });
    });

    it("should reject registration with invalid plan", async () => {
      const userData = {
        email: "invalid@example.com",
        password: "SecurePass123",
        name: "Invalid User",
        plan: "ENTERPRISE", // Invalid plan
      };

      const registerResponse = await request(app)
        .post("/api/v1/auth/sign-up")
        .send(userData)
        .expect(422);

      expect(registerResponse.body).toMatchObject({
        error: "Validation Error",
        message: "Request validation failed",
        errorCode: "VALIDATION_ERROR",
        details: expect.arrayContaining([
          expect.objectContaining({
            field: "plan",
            type: "any.only",
          }),
        ]),
      });
    });
  });

  describe("User Retrieval with New Properties", () => {
    it("should retrieve user with all properties after registration", async () => {
      // Register a user with custom properties
      const userData = {
        email: "retrieve@example.com",
        password: "SecurePass123",
        name: "Retrieve User",
        profileImage: "https://example.com/retrieve.jpg",
        isActive: true,
        isVerified: false,
        role: "ADMIN",
        plan: "PREMIUM",
      };

      const registerResponse = await request(app)
        .post("/api/v1/auth/sign-up")
        .send(userData)
        .expect(201);

      const userId = registerResponse.body.data.userId;

      // Login to get token
      const loginResponse = await request(app)
        .post("/api/v1/auth/sign-in")
        .send({
          email: "retrieve@example.com",
          password: "SecurePass123",
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // Get specific user
      const getUserResponse = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(getUserResponse.body).toMatchObject({
        data: {
          id: userId,
          email: "retrieve@example.com",
          name: "Retrieve User",
          profileImage: "https://example.com/retrieve.jpg",
          isActive: true,
          isVerified: false,
          role: "ADMIN",
          plan: "PREMIUM",
          createdAt: expect.any(String),
        },
      });

      // Get all users (should include the user with all properties)
      const getUsersResponse = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const foundUser = getUsersResponse.body.data.users.find(
        (user: any) => user.id === userId,
      );
      expect(foundUser).toMatchObject({
        id: userId,
        email: "retrieve@example.com",
        name: "Retrieve User",
        profileImage: "https://example.com/retrieve.jpg",
        isActive: true,
        isVerified: false,
        role: "ADMIN",
        plan: "PREMIUM",
      });
    });
  });
});
