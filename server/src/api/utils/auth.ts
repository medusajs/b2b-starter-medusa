import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";

// Enforce presence of publishable key for Store API
export function requirePublishableKey(
  req: MedusaRequest,
  res: MedusaResponse
): string | undefined {
  const header = (req.headers["x-publishable-api-key"] || req.headers["x-publishable-key"]) as
    | string
    | undefined;
  if (!header) {
    res.status(401).json({
      message: "Missing x-publishable-api-key header",
      code: "missing_publishable_key",
    });
    return undefined;
  }
  return header;
}

// Minimal JWT check for store approvals (scaffold)
export function requireJWT(
  req: MedusaRequest,
  res: MedusaResponse
): string | undefined {
  const auth = (req.headers["authorization"] as string | undefined) || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ message: "Unauthorized", code: "unauthorized" });
    return undefined;
  }
  return token;
}

