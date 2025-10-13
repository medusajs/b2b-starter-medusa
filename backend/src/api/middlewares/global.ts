/**
 * 🌐 Global API Middlewares
 * Request ID, API Version, and Error Handling
 */

import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http";
import { APIVersionManager } from "../../utils/api-versioning";
import { APIResponse } from "../../utils/api-response";

// ============================================================================
// Request ID Middleware
// ============================================================================

export function requestIdMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const requestId =
    (req.headers["x-request-id"] as string) ||
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  res.setHeader("X-Request-ID", requestId);
  (req as any).requestId = requestId;

  next();
}

// ============================================================================
// API Version Middleware
// ============================================================================

export function apiVersionMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Read version from header or query
  const requestedVersion =
    (req.headers["x-api-version"] as string) ||
    (req.query?.api_version as string);

  // Set current version in response
  const currentVersion = APIVersionManager.formatVersion(
    APIVersionManager.CURRENT_API_VERSION
  );
  res.setHeader("X-API-Version", currentVersion);

  // Validate requested version if provided
  if (requestedVersion) {
    try {
      const parsedVersion = APIVersionManager.parseVersion(requestedVersion);
      if (!APIVersionManager.isVersionSupported(parsedVersion)) {
        APIResponse.error(
          res,
          "E400_UNSUPPORTED_VERSION",
          `API version ${requestedVersion} is not supported. Current version: ${currentVersion}`,
          400
        );
        return;
      }
      (req as any).apiVersion = parsedVersion;
    } catch (error) {
      APIResponse.validationError(
        res,
        `Invalid API version format: ${requestedVersion}`
      );
      return;
    }
  }

  next();
}

// ============================================================================
// Global Error Handler
// ============================================================================

export function globalErrorHandler(
  error: Error,
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  console.error("[Global Error Handler]", {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    requestId: (req as any).requestId,
  });

  // Check if response already sent
  if (res.headersSent) {
    return next(error);
  }

  APIResponse.internalError(res, "An unexpected error occurred");
}

// ============================================================================
// Combined Global Middleware Stack
// ============================================================================

export function applyGlobalMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  requestIdMiddleware(req, res, () => {
    apiVersionMiddleware(req, res, next);
  });
}
