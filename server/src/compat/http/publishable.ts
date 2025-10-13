import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { err } from "./response";

export function requirePublishableKey(
  req: MedusaRequest,
  res: MedusaResponse
): string | undefined {
  const key = (req.headers["x-publishable-api-key"] || req.headers["x-publishable-key"]) as
    | string
    | undefined;
  if (!key) return err(req, res, 401, "MISSING_PUBLISHABLE_KEY", "Missing x-publishable-api-key header") as any
  // TODO: optionally validate key -> sales channel mapping
  return key;
}

export function requireJWT(
  req: MedusaRequest,
  res: MedusaResponse
): string | undefined {
  const auth = (req.headers["authorization"] as string | undefined) || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
  if (!token) return err(req, res, 401, "UNAUTHORIZED", "Unauthorized") as any
  return token;
}
