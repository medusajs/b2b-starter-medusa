/**
 * Unit tests for solar CV middlewares
 */

import {
  cvCorsMiddleware,
  validateRequestSize,
  apiKeyAuthMiddleware,
} from "../solar-cv";

describe("Solar CV Middlewares", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;
  const originalEnv = process.env;

  beforeEach(() => {
    mockReq = {
      headers: {},
      method: "GET",
      path: "/solar/test",
    };
    mockRes = {
      setHeader: jest.fn(),
      getHeader: jest.fn().mockReturnValue("req-test-123"),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
    mockNext = jest.fn();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("cvCorsMiddleware", () => {
    it("should allow wildcard in development", () => {
      process.env.NODE_ENV = "development";
      process.env.CV_CORS_ORIGINS = "*";

      cvCorsMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject wildcard in production", () => {
      process.env.NODE_ENV = "production";
      delete process.env.CV_CORS_ORIGINS;

      cvCorsMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should allow specific origin in production", () => {
      process.env.NODE_ENV = "production";
      process.env.CV_CORS_ORIGINS = "https://example.com";
      mockReq.headers.origin = "https://example.com";

      cvCorsMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "https://example.com"
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle OPTIONS preflight", () => {
      process.env.NODE_ENV = "development";
      process.env.CV_CORS_ORIGINS = "*";
      mockReq.method = "OPTIONS";

      cvCorsMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });
  });

  describe("validateRequestSize", () => {
    it("should allow requests within size limit", () => {
      mockReq.headers["content-length"] = "1000000"; // 1MB
      const middleware = validateRequestSize(10);

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should reject requests exceeding size limit", () => {
      mockReq.headers["content-length"] = "20000000"; // 20MB
      const middleware = validateRequestSize(10);

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "E413_PAYLOAD_TOO_LARGE",
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle missing content-length header", () => {
      const middleware = validateRequestSize(10);

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("apiKeyAuthMiddleware", () => {
    it("should allow requests in development without API key", () => {
      process.env.NODE_ENV = "development";
      delete process.env.SOLAR_CV_API_KEYS;

      apiKeyAuthMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject requests without valid API key", () => {
      process.env.NODE_ENV = "production";
      process.env.SOLAR_CV_API_KEYS = "valid-key-123";

      apiKeyAuthMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should allow requests with valid API key", () => {
      process.env.NODE_ENV = "production";
      process.env.SOLAR_CV_API_KEYS = "valid-key-123,another-key";
      mockReq.headers["x-api-key"] = "valid-key-123";

      apiKeyAuthMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
