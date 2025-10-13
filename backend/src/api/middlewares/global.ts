/**
 * 🌐 Global API Middlewares
 * Request ID, API versioning, error handling
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
  const requestedVersion =
    (req.headers["x-api-version"] as string) ||
    (req.query?.api_version as string);

  const currentVersion = APIVersionManager.formatVersion(
    APIVersionManager.CURRENT_API_VERSION
  );

  res.setHeader("X-API-Version", currentVersion);

  if (requestedVersion && !APIVersionManager.isSupported(requestedVersion)) {
    APIResponse.error(
      res,
      "E400_INVALID_INPUT",
      `API version ${requestedVersion} is not supported`,
      400,
      { supported_versions: APIVersionManager.getSupportedVersions() }
    );
    return;
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

  if (res.headersSent) {
    return next(error);
  }

  APIResponse.internalError(res, "Internal server error");
}
