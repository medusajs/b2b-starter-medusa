import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import ANEELTariffService from "../../../modules/aneel-tariff/service"

/**
 * POST /api/aneel/calculate-savings
 * Calcula economia com sistema solar
 * Body: { 
 *   monthly_consumption_kwh: number, 
 *   system_generation_kwh: number, 
 *   uf: string, 
 *   grupo?: "B1" | "B2" | "B3" | "A4" 
 * }
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const {
            monthly_consumption_kwh,
            system_generation_kwh,
            uf,
            grupo = "B1"
        } = req.body as {
            monthly_consumption_kwh: number
            system_generation_kwh: number
            uf: string
            grupo?: "B1" | "B2" | "B3" | "A4"
        }

        if (!monthly_consumption_kwh || !system_generation_kwh || !uf) {
            res.status(400).json({
                error: "Missing required parameters",
                required: ["monthly_consumption_kwh", "system_generation_kwh", "uf"]
            })
            return
        }

        const aneelService = new ANEELTariffService()
        const savings = aneelService.calculateSolarSavings(
            monthly_consumption_kwh,
            system_generation_kwh,
            uf,
            grupo as "B1" | "B2" | "B3" | "A4"
        )

        res.json(savings)
    } catch (error) {
        console.error("Error calculating savings:", error)
        throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message)
    }
}
