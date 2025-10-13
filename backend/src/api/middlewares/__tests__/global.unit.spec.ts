/**
 * Unit tests for global middlewares
 */

import { requestIdMiddleware, apiVersionMiddleware, globalErrorHandler } from "../global";
import { APIVersionManager } from "../../../utils/api-versioning";

describe("Global Middlewares", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
      query: {},
      path: "/test",
      method: "GET",
    };
    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false,
    };
    mockNext = jest.fn();
  });

  describe("requestIdMiddleware", () => {
    it("should generate request ID if not provided", () => {
      requestIdMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "X-Request-ID",
        expect.stringMatching(/^req-\d+-[a-z0-9]+$/)
      );
      expect(mockReq.requestId).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it("should use provided request ID", () => {
      mockReq.headers["x-request-id"] = "custom-id-123";

      requestIdMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith("X-Request-ID", "custom-id-123");
      expect(mockReq.requestId).toBe("custom-id-123");
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("apiVersionMiddleware", () => {
    it("should set current API version header", () => {
      apiVersionMiddleware(mockReq, mockRes, mockNext);

      const expectedVersion = APIVersionManager.formatVersion(
        APIVersionManager.CURRENT_API_VERSION
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith("X-API-Version", expectedVersion);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject unsupported API version", () => {
      mockReq.headers["x-api-version"] = "v99.99.99";

      apiVersionMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "E400_INVALID_INPUT",
            message: expect.stringContaining("not supported"),
          }),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should accept version from query parameter", () => {
      const currentVersion = APIVersionManager.formatVersion(
        APIVersionManager.CURRENT_API_VERSION
      );
      mockReq.query.api_version = currentVersion;

      apiVersionMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("globalErrorHandler", () => {
    it("should handle errors and return 500", () => {
      const error = new Error("Test error");

      globalErrorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "E500_INTERNAL",
            message: "Internal server error",
          }),
        })
      );
    });

    it("should not send response if headers already sent", () => {
      mockRes.headersSent = true;
      const error = new Error("Test error");

      globalErrorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
