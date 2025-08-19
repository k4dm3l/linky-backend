import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { notFoundMiddleware } from "@/app/infrastructure/middleware/not-found-middleware";

describe("Not Found Middleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      method: "GET",
      originalUrl: "/api/nonexistent",
    } as Request;
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      headersSent: false,
    } as unknown as Response;
    next = vi.fn() as unknown as NextFunction;
  });

  it("should return 404 status code", () => {
    notFoundMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
  });

  it("should return proper error response structure", () => {
    notFoundMiddleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: "Not Found",
      message: "Route GET /api/nonexistent not found",
      errorCode: "ROUTE_NOT_FOUND",
      timestamp: expect.any(String),
      path: "/api/nonexistent",
      method: "GET",
    });
  });

  it("should include timestamp in ISO format", () => {
    const beforeCall = new Date();
    notFoundMiddleware(req, res, next);
    const afterCall = new Date();

    const callArgs = (res.json as any).mock.calls[0][0];
    const timestamp = new Date(callArgs.timestamp);

    expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
    expect(timestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime());
  });

  it("should handle different HTTP methods", () => {
    req.method = "POST";
    req.originalUrl = "/api/v1/users/123";

    notFoundMiddleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: "Not Found",
      message: "Route POST /api/v1/users/123 not found",
      errorCode: "ROUTE_NOT_FOUND",
      timestamp: expect.any(String),
      path: "/api/v1/users/123",
      method: "POST",
    });
  });

  it("should handle complex URLs with query parameters", () => {
    req.method = "PUT";
    req.originalUrl = "/api/v1/users/123?include=profile&fields=name,email";

    notFoundMiddleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: "Not Found",
      message:
        "Route PUT /api/v1/users/123?include=profile&fields=name,email not found",
      errorCode: "ROUTE_NOT_FOUND",
      timestamp: expect.any(String),
      path: "/api/v1/users/123?include=profile&fields=name,email",
      method: "PUT",
    });
  });

  it("should call next() if headers are already sent", () => {
    res.headersSent = true;

    notFoundMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should not call next() if headers are not sent", () => {
    notFoundMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it("should handle root path", () => {
    req.method = "GET";
    req.originalUrl = "/";

    notFoundMiddleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: "Not Found",
      message: "Route GET / not found",
      errorCode: "ROUTE_NOT_FOUND",
      timestamp: expect.any(String),
      path: "/",
      method: "GET",
    });
  });

  it("should handle empty path", () => {
    req.method = "DELETE";
    req.originalUrl = "";

    notFoundMiddleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: "Not Found",
      message: "Route DELETE  not found",
      errorCode: "ROUTE_NOT_FOUND",
      timestamp: expect.any(String),
      path: "",
      method: "DELETE",
    });
  });
});
