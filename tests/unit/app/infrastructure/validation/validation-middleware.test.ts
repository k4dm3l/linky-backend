import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { vi, describe, it, expect, beforeEach } from "vitest";

import {
	validateRequest,
	validateQuery,
	validateParams,
} from "@/app/infrastructure/validation/validation-middleware";

describe("Validation Middleware", () => {
	let req: Request;
	let res: Response;
	let next: NextFunction;

	beforeEach(() => {
		req = {} as Request;
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as unknown as Response;
		next = vi.fn() as unknown as NextFunction;
	});

	describe("validateRequest", () => {
		const schema = Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string().min(8).required(),
		});

		it("should call next() when validation passes", () => {
			req.body = {
				email: "test@example.com",
				password: "password123",
			};

			const middleware = validateRequest(schema);
			middleware(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(res.status).not.toHaveBeenCalled();
			expect(res.json).not.toHaveBeenCalled();
		});

		it("should return validation error when validation fails", () => {
			req.body = {
				email: "invalid-email",
				password: "short",
			};

			const middleware = validateRequest(schema);
			middleware(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.UNPROCESSABLE_ENTITY);
			expect(res.json).toHaveBeenCalledWith({
				error: "Validation Error",
				message: "Request validation failed",
				details: expect.arrayContaining([
					expect.objectContaining({
						field: "email",
						message: expect.stringContaining("valid email"),
						type: "string.email",
					}),
					expect.objectContaining({
						field: "password",
						message: expect.stringContaining("8 characters"),
						type: "string.min",
					}),
				]),
				errorCode: "VALIDATION_ERROR",
			});
		});

		it("should strip unknown fields when validation passes", () => {
			req.body = {
				email: "test@example.com",
				password: "password123",
				unknownField: "should be removed",
			};

			const middleware = validateRequest(schema);
			middleware(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(req.body).toEqual({
				email: "test@example.com",
				password: "password123",
			});
		});
	});

	describe("validateQuery", () => {
		const schema = Joi.object({
			limit: Joi.number().integer().min(1).max(100),
			offset: Joi.number().integer().min(0),
		});

		it("should call next() when validation passes", () => {
			req.query = {
				limit: "10",
				offset: "0",
			};

			const middleware = validateQuery(schema);
			middleware(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(res.status).not.toHaveBeenCalled();
			expect(res.json).not.toHaveBeenCalled();
		});

		it("should return validation error when validation fails", () => {
			req.query = {
				limit: "invalid",
				offset: "-1",
			};

			const middleware = validateQuery(schema);
			middleware(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.json).toHaveBeenCalledWith({
				error: "Validation Error",
				message: "Query validation failed",
				details: expect.arrayContaining([
					expect.objectContaining({
						field: "limit",
						type: "number.base",
					}),
					expect.objectContaining({
						field: "offset",
						type: "number.min",
					}),
				]),
				errorCode: "VALIDATION_ERROR",
			});
		});
	});

	describe("validateParams", () => {
		const schema = Joi.object({
			id: Joi.string().required(),
		});

		it("should call next() when validation passes", () => {
			req.params = {
				id: "user-123",
			};

			const middleware = validateParams(schema);
			middleware(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(res.status).not.toHaveBeenCalled();
			expect(res.json).not.toHaveBeenCalled();
		});

		it("should return validation error when validation fails", () => {
			req.params = {
				id: "",
			};

			const middleware = validateParams(schema);
			middleware(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
			expect(res.json).toHaveBeenCalledWith({
				error: "Validation Error",
				message: "Parameter validation failed",
				details: expect.arrayContaining([
					expect.objectContaining({
						field: "id",
						type: "string.empty",
					}),
				]),
				errorCode: "VALIDATION_ERROR",
			});
		});
	});
}); 