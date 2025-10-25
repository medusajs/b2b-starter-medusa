/**
 * Unit tests for API response helpers
 */

import { APIResponse, ERROR_CODES } from "../api-response";

describe("APIResponse", () => {
  let mockRes: any;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      getHeader: jest.fn().mockReturnValue("req-test-123"),
    };
  });

  describe("success", () => {
    it("should send success response with data", () => {
      const data = { id: 1, name: "Test" };

      APIResponse.success(mockRes, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        request_id: "req-test-123",
      });
    });

    it("should include meta when provided", () => {
      const data = [{ id: 1 }];
      const meta = { limit: 10, offset: 0, count: 1, total: 1 };

      APIResponse.success(mockRes, data, meta);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        meta,
        request_id: "req-test-123",
      });
    });

    it("should use custom status code", () => {
      APIResponse.success(mockRes, {}, undefined, 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe("paginated", () => {
    it("should send paginated response", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = { limit: 10, offset: 0, count: 2, total: 100 };

      APIResponse.paginated(mockRes, data, pagination);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data,
        meta: pagination,
        request_id: "req-test-123",
      });
    });
  });

  describe("error", () => {
    it("should send error response", () => {
      APIResponse.error(mockRes, "E400_VALIDATION", "Invalid input", 400);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "E400_VALIDATION",
          message: "Invalid input",
          request_id: "req-test-123",
          timestamp: expect.any(String),
        },
      });
    });

    it("should include details when provided", () => {
      const details = { field: "email", reason: "invalid format" };

      APIResponse.error(mockRes, "E400_VALIDATION", "Invalid input", 400, details);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ details }),
        })
      );
    });
  });

  describe("validationError", () => {
    it("should send 400 validation error", () => {
      APIResponse.validationError(mockRes, "Invalid email");

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ERROR_CODES.E400_VALIDATION,
            message: "Invalid email",
          }),
        })
      );
    });
  });

  describe("unauthorized", () => {
    it("should send 401 unauthorized error", () => {
      APIResponse.unauthorized(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ERROR_CODES.E401_UNAUTHORIZED,
          }),
        })
      );
    });
  });

  describe("forbidden", () => {
    it("should send 403 forbidden error", () => {
      APIResponse.forbidden(mockRes, "Access denied");

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ERROR_CODES.E403_FORBIDDEN,
            message: "Access denied",
          }),
        })
      );
    });
  });

  describe("notFound", () => {
    it("should send 404 not found error", () => {
      APIResponse.notFound(mockRes, "Resource not found");

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ERROR_CODES.E404_NOT_FOUND,
          }),
        })
      );
    });
  });

  describe("rateLimit", () => {
    it("should send 429 rate limit error with headers", () => {
      const retryAfter = 60;
      const limit = 100;
      const resetTime = new Date().toISOString();

      APIResponse.rateLimit(mockRes, retryAfter, limit, resetTime);

      expect(mockRes.setHeader).toHaveBeenCalledWith("Retry-After", "60");
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ERROR_CODES.E429_RATE_LIMIT,
            details: {
              retry_after: retryAfter,
              limit,
              reset_time: resetTime,
            },
          }),
        })
      );
    });
  });

  describe("internalError", () => {
    it("should send 500 internal error", () => {
      APIResponse.internalError(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ERROR_CODES.E500_INTERNAL,
          }),
        })
      );
    });
  });

  describe("serviceUnavailable", () => {
    it("should send 503 service unavailable error", () => {
      APIResponse.serviceUnavailable(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ERROR_CODES.E503_UNAVAILABLE,
          }),
        })
      );
    });
  });
});
