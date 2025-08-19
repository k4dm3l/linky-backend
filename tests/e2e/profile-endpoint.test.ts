import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

import { Server } from "@/app/server";

describe("Profile Endpoint E2E", () => {
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

	describe("GET /api/v1/auth/profile", () => {
		it("should return complete user profile for authenticated user", async () => {
			// Register a user with custom properties
			const userData = {
				email: "profile@example.com",
				password: "SecurePass123",
				name: "Profile User",
				profileImage: "https://example.com/profile.jpg",
				isActive: true,
				isVerified: false,
				role: "ADMIN",
				plan: "PREMIUM"
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
					email: "profile@example.com",
					password: "SecurePass123"
				})
				.expect(200);

			const token = loginResponse.body.data.token;

			// Get profile
			const profileResponse = await request(app)
				.get("/api/v1/auth/profile")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(profileResponse.body).toMatchObject({
				data: {
					userId: userId,
					email: "profile@example.com",
					name: "Profile User",
					profileImage: "https://example.com/profile.jpg",
					isActive: true,
					isVerified: false,
					role: "ADMIN",
					plan: "PREMIUM",
					createdAt: expect.any(String)
				}
			});

			// Verify all required fields are present
			expect(profileResponse.body.data).toHaveProperty("userId");
			expect(profileResponse.body.data).toHaveProperty("email");
			expect(profileResponse.body.data).toHaveProperty("name");
			expect(profileResponse.body.data).toHaveProperty("profileImage");
			expect(profileResponse.body.data).toHaveProperty("isActive");
			expect(profileResponse.body.data).toHaveProperty("isVerified");
			expect(profileResponse.body.data).toHaveProperty("role");
			expect(profileResponse.body.data).toHaveProperty("plan");
			expect(profileResponse.body.data).toHaveProperty("createdAt");
		});

		it("should return complete user profile with default values", async () => {
			// Register a user with only required fields (defaults for optional fields)
			const userData = {
				email: "default@example.com",
				password: "SecurePass123",
				name: "Default Profile User"
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
					email: "default@example.com",
					password: "SecurePass123"
				})
				.expect(200);

			const token = loginResponse.body.data.token;

			// Get profile
			const profileResponse = await request(app)
				.get("/api/v1/auth/profile")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(profileResponse.body).toMatchObject({
				data: {
					userId: userId,
					email: "default@example.com",
					name: "Default Profile User",
					profileImage: null,
					isActive: true,
					isVerified: false,
					role: "USER",
					plan: "STANDARD",
					createdAt: expect.any(String)
				}
			});
		});

		it("should return 401 for unauthenticated request", async () => {
			const profileResponse = await request(app)
				.get("/api/v1/auth/profile")
				.expect(401);

			expect(profileResponse.body).toMatchObject({
				error: "Unauthorized",
				message: "No auth token"
			});
		});

		it("should return 401 for invalid token", async () => {
			const profileResponse = await request(app)
				.get("/api/v1/auth/profile")
				.set("Authorization", "Bearer invalid-token")
				.expect(401);

			expect(profileResponse.body).toMatchObject({
				error: "Unauthorized",
				message: "jwt malformed"
			});
		});

		it("should return 404 if user profile not found", async () => {
			// Register and login a user
			const userData = {
				email: "notfound@example.com",
				password: "SecurePass123",
				name: "Not Found User"
			};

			await request(app)
				.post("/api/v1/auth/sign-up")
				.send(userData)
				.expect(201);

			const loginResponse = await request(app)
				.post("/api/v1/auth/sign-in")
				.send({
					email: "notfound@example.com",
					password: "SecurePass123"
				})
				.expect(200);

			const token = loginResponse.body.data.token;

			// Manually clear the user repository to simulate user not found
			const container = server.getContainer();
			const userRepository = container.resolve("userRepository") as any;
			userRepository.clear();

			// Try to get profile - should return 404
			const profileResponse = await request(app)
				.get("/api/v1/auth/profile")
				.set("Authorization", `Bearer ${token}`)
				.expect(404);

			expect(profileResponse.body).toMatchObject({
				error: "User not found",
				errorCode: "USER_NOT_FOUND"
			});
		});
	});
}); 