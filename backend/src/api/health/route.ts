import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { APIResponse } from "../../utils/api-response"
import { APIVersionManager } from "../../utils/api-versioning"

export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: { database: { status: "up" }, redis: { status: "up" } },
    metrics: {
      uptime_seconds: process.uptime(),
      memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
  }

  res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))
  APIResponse.success(res, health)
}
