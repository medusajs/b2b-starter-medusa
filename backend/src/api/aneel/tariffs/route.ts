import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ANEELTariffService from "../../../modules/aneel-tariff/service"

/**
 * GET /api/aneel/tariffs
 * Lista tarifas por UF e grupo
 * Query params: uf (required), grupo (optional, default: B1)
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { uf, grupo = "B1" } = req.query

        if (!uf) {
            res.status(400).json({
                error: "Missing required parameter: uf"
            })
            return
        }

        const aneelService = new ANEELTariffService()
        const tariff = aneelService.getTariffByUF(
            uf as string,
            grupo as "B1" | "B2" | "B3" | "A4"
        )

        if (!tariff) {
            res.status(404).json({
                error: "Tariff not found for specified UF and group",
                uf,
                grupo
            })
            return
        }

        res.json({ tariff })
    } catch (error) {
        console.error("Error fetching ANEEL tariff:", error)
        res.status(500).json({
            error: "Failed to fetch tariff",
            message: error.message
        })
    }
}
