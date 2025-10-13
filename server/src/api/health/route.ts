import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const API_VERSION = "v2.0"

async function pingDb(): Promise<"ok" | "down"> {
    // TODO: implement actual database ping
    return "ok"
}

async function pingRedis(): Promise<"ok" | "down"> {
    // TODO: implement actual Redis ping
    return "ok"
}

async function pingExternal(): Promise<"ok" | "degraded" | "down"> {
    // TODO: implement external services ping
    return "ok"
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    res.setHeader("X-API-Version", API_VERSION)

    try {
        const [db, redis, ext] = await Promise.all([
            pingDb(),
            pingRedis(),
            pingExternal()
        ])

        const status =
            db === "ok" && redis === "ok" && (ext === "ok" || ext === "degraded")
                ? "ok"
                : "degraded"

        return res.status(status === "ok" ? 200 : 206).json({
            success: true,
            data: {
                status,
                deps: { db, redis, external: ext }
            },
            meta: { stale: false }
        })
    } catch (e: any) {
        return res.status(503).json({
            success: false,
            error: {
                code: "HEALTH_CHECK_FAILED",
                message: e?.message ?? "unavailable"
            }
        })
    }
}
