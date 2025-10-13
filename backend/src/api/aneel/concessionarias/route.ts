import type { MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import ANEELTariffService from "../../../modules/aneel-tariff/service"

/**
 * GET /api/aneel/concessionarias
 * Lista concessionárias por UF
 * Query params: uf (optional)
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { uf } = req.query
        const aneelService = new ANEELTariffService()

        let concessionarias
        if (uf) {
            concessionarias = aneelService.getConcessionariasByUF(uf as string)
        } else {
            concessionarias = aneelService.listConcessionarias()
        }

        res.json({
            concessionarias,
            count: concessionarias.length
        })
    } catch (error: any) {
        console.error("Error fetching concessionarias:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to fetch concessionarias")
    }
}
