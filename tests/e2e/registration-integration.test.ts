import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

import { Server } from "@/app/server";

describe("Registration Integration E2E", () => {
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

	describe("User Registration and Retrieval", () => {
		it("should register a user and then be able to retrieve it from user endpoints", async () => {
			// Step 1: Register a new user
			const userData = {
				email: "test@example.com",
				password: "SecurePass123",
				name: "John Doe"
			};

			const registerResponse = await request(app)
				.post("/api/v1/auth/sign-up")
				.send(userData)
				.expect(201);

			expect(registerResponse.body).toMatchObject({
				data: {
					userId: expect.any(String),
					email: "test@example.com",
					name: "John Doe",
					isActive: true,
					isVerified: false,
					plan: "STANDARD",
					role: "USER",
					profileImage: null,
				},
				message: "User registered successfully",
			});

			const userId = registerResponse.body.data.userId;

			// Step 2: Login to get a token
			const loginResponse = await request(app)
				.post("/api/v1/auth/sign-in")
				.send({
					email: "test@example.com",
					password: "SecurePass123"
				})
				.expect(200);

			expect(loginResponse.body).toMatchObject({
				data: {
					userId: expect.any(String),
					email: "test@example.com",
					token: expect.any(String),
				},
				message: "Login successful"
			});
			const token = loginResponse.body.data.token;

			// Step 3: Get all users (should include the registered user)
			const getUsersResponse = await request(app)
				.get("/api/v1/users")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(getUsersResponse.body).toMatchObject({
				data: {
					users: expect.arrayContaining([
						expect.objectContaining({
							id: userId,
							email: "test@example.com",
							name: "John Doe"
						})
					]),
					total: expect.any(Number),
					hasMore: expect.any(Boolean)
				}
			});

			// Step 4: Get specific user by ID
			const getUserResponse = await request(app)
				.get(`/api/v1/users/${userId}`)
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(getUserResponse.body).toMatchObject({
				data: {
					id: userId,
					email: "test@example.com",
					name: "John Doe"
				}
			});
		});

		it("should handle multiple user registrations correctly", async () => {
			// Register first user
			const user1Data = {
				email: "user1@example.com",
				password: "SecurePass123",
				name: "User One"
			};

			const register1Response = await request(app)
				.post("/api/v1/auth/sign-up")
				.send(user1Data)
				.expect(201);

			const userId1 = register1Response.body.data.userId;

			// Register second user
			const user2Data = {
				email: "user2@example.com",
				password: "SecurePass123",
				name: "User Two"
			};

			const register2Response = await request(app)
				.post("/api/v1/auth/sign-up")
				.send(user2Data)
				.expect(201);

			const userId2 = register2Response.body.data.userId;

			// Login with first user
			const loginResponse = await request(app)
				.post("/api/v1/auth/sign-in")
				.send({
					email: "user1@example.com",
					password: "SecurePass123"
				})
				.expect(200);

			expect(loginResponse.body).toMatchObject({
				data: {
					userId: expect.any(String),
					email: "user1@example.com",
					token: expect.any(String),
				},
				message: "Login successful"
			});
			const token = loginResponse.body.data.token;

			// Get all users (should include both users)
			const getUsersResponse = await request(app)
				.get("/api/v1/users")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(getUsersResponse.body).toMatchObject({
				data: {
					users: expect.arrayContaining([
						expect.objectContaining({ email: "user1@example.com" }),
						expect.objectContaining({ email: "user2@example.com" })
					]),
					total: 3,
					limit: 10,
					offset: 0,
					hasMore: false
				}
			});

			expect(getUsersResponse.body.data.users).toHaveLength(3);
			expect(getUsersResponse.body.data.total).toBe(3);

			// Verify both users are in the list
			const userEmails = getUsersResponse.body.data.users.map((user: any) => user.email);
			expect(userEmails).toContain("user1@example.com");
			expect(userEmails).toContain("user2@example.com");
		});
	});
}); 