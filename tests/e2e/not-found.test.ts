import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

import { Server } from "@/app/server";

describe("Not Found Middleware E2E", () => {
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

	describe("GET /nonexistent", () => {
		it("should return 404 for non-existent route", async () => {
			const response = await request(app)
				.get("/nonexistent")
				.expect(404);

			expect(response.body).toEqual({
				error: "Not Found",
				message: "Route GET /nonexistent not found",
				errorCode: "ROUTE_NOT_FOUND",
				timestamp: expect.any(String),
				path: "/nonexistent",
				method: "GET",
			});
		});
	});

	describe("POST /api/nonexistent", () => {
		it("should return 404 for non-existent API route", async () => {
			const response = await request(app)
				.post("/api/nonexistent")
				.send({ data: "test" })
				.expect(404);

			expect(response.body).toEqual({
				error: "Not Found",
				message: "Route POST /api/nonexistent not found",
				errorCode: "ROUTE_NOT_FOUND",
				timestamp: expect.any(String),
				path: "/api/nonexistent",
				method: "POST",
			});
		});
	});

	describe("PUT /api/v1/users/nonexistent", () => {
		it("should return 404 for non-existent nested route", async () => {
			const response = await request(app)
				.put("/api/v1/users/nonexistent")
				.send({ name: "test" })
				.expect(404);

			expect(response.body).toEqual({
				error: "Not Found",
				message: "Route PUT /api/v1/users/nonexistent not found",
				errorCode: "ROUTE_NOT_FOUND",
				timestamp: expect.any(String),
				path: "/api/v1/users/nonexistent",
				method: "PUT",
			});
		});
	});

	describe("DELETE /api/v1/auth/nonexistent", () => {
		it("should return 404 for non-existent auth route", async () => {
			const response = await request(app)
				.delete("/api/v1/auth/nonexistent")
				.expect(404);

			expect(response.body).toEqual({
				error: "Not Found",
				message: "Route DELETE /api/v1/auth/nonexistent not found",
				errorCode: "ROUTE_NOT_FOUND",
				timestamp: expect.any(String),
				path: "/api/v1/auth/nonexistent",
				method: "DELETE",
			});
		});
	});

	describe("GET / with query parameters", () => {
		it("should return 404 for root path with query params", async () => {
			const response = await request(app)
				.get("/?param1=value1&param2=value2")
				.expect(404);

			expect(response.body).toEqual({
				error: "Not Found",
				message: "Route GET /?param1=value1&param2=value2 not found",
				errorCode: "ROUTE_NOT_FOUND",
				timestamp: expect.any(String),
				path: "/?param1=value1&param2=value2",
				method: "GET",
			});
		});
	});

	describe("PATCH /api/nonexistent/123", () => {
		it("should return 404 for PATCH method", async () => {
			const response = await request(app)
				.patch("/api/nonexistent/123")
				.send({ field: "value" })
				.expect(404);

			expect(response.body).toEqual({
				error: "Not Found",
				message: "Route PATCH /api/nonexistent/123 not found",
				errorCode: "ROUTE_NOT_FOUND",
				timestamp: expect.any(String),
				path: "/api/nonexistent/123",
				method: "PATCH",
			});
		});
	});

	describe("OPTIONS /api/nonexistent", () => {
		it("should return 404 for OPTIONS method", async () => {
			const response = await request(app)
				.options("/api/nonexistent")
				.expect(404);

			expect(response.body).toEqual({
				error: "Not Found",
				message: "Route OPTIONS /api/nonexistent not found",
				errorCode: "ROUTE_NOT_FOUND",
				timestamp: expect.any(String),
				path: "/api/nonexistent",
				method: "OPTIONS",
			});
		});
	});

	describe("HEAD /api/nonexistent", () => {
		it("should return 404 for HEAD method", async () => {
			const response = await request(app)
				.head("/api/nonexistent")
				.expect(404);

			// HEAD requests typically don't have a body, but our middleware still sets the status
			expect(response.status).toBe(404);
		});
	});
}); 