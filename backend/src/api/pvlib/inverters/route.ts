import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MedusaError } from "@medusajs/framework/utils"
import PVLibIntegrationService from "../../../modules/pvlib-integration/service"

/**
 * GET /api/pvlib/inverters
 * Lista inversores disponíveis no banco PVLib
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const pvlibService = new PVLibIntegrationService()

        const {
            complete_only = "false",
            power_w,
            tolerance = "0.2"
        } = req.query

        let inverters

        // Filtrar por potência se fornecido
        if (power_w) {
            const powerNum = parseFloat(power_w as string)
            const toleranceNum = parseFloat(tolerance as string)
            inverters = await pvlibService.findInvertersByPower(powerNum, toleranceNum)
        } else if (complete_only === "true") {
            inverters = await pvlibService.listCompleteInverters()
        } else {
            inverters = await pvlibService.loadInverters()
        }

        res.json({
            inverters,
            count: inverters.length
        })
    } catch (error: any) {
        console.error("Error fetching PVLib inverters:", error)
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to fetch PVLib inverters")
    }
}
