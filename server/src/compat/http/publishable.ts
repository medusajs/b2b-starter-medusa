import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export function requirePublishableKey(
  req: MedusaRequest,
  res: MedusaResponse
): string | undefined {
  const key = (req.headers["x-publishable-api-key"] || req.headers["x-publishable-key"]) as
    | string
    | undefined;
  if (!key) {
    res.status(401).json({
      message: "Missing x-publishable-api-key header",
      code: "missing_publishable_key",
    });
    return undefined;
  }
  // TODO: optionally validate key -> sales channel mapping
  return key;
}

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

