import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MedusaError } from "@medusajs/framework/utils"
import PVLibIntegrationService from "../../../modules/pvlib-integration/service"
import { APIResponse } from "../../../utils/api-response"
import { APIVersionManager } from "../../../utils/api-versioning"

/**
 * POST /api/pvlib/validate-mppt
 * Valida compatibilidade MPPT entre inversor e painel
 * Body: { inverter_id: string, panel_id: string, modules_per_string: number }
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { inverter_id, panel_id, modules_per_string } = req.body as {
            inverter_id: string
            panel_id: string
            modules_per_string: number
        }

        if (!inverter_id || !panel_id || !modules_per_string) {
            APIResponse.validationError(res, "Missing required parameters", {
                required: ["inverter_id", "panel_id", "modules_per_string"]
            })
            return
        }

        const pvlibService = new PVLibIntegrationService()

        const inverter = await pvlibService.getInverterById(inverter_id)
        const panel = await pvlibService.getPanelById(panel_id)

        if (!inverter) {
            APIResponse.notFound(res, `Inverter not found: ${inverter_id}`)
            return
        }

        if (!panel) {
            APIResponse.notFound(res, `Panel not found: ${panel_id}`)
            return
        }

        const validation = pvlibService.validateMPPT(inverter, panel, modules_per_string)

        res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))
        APIResponse.success(res, {
            validation,
            inverter: {
                id: inverter.id,
                name: inverter.name,
                mppt_range: {
                    low: inverter.sandia_params.Mppt_low,
                    high: inverter.sandia_params.Mppt_high
                }
            },
            panel: {
                id: panel.id,
                name: panel.name,
                specs: {
                    v_mp: panel.cec_params.V_mp_ref,
                    v_oc: panel.cec_params.V_oc_ref
                }
            }
        })
    } catch (error: any) {
        console.error("Error validating MPPT:", error)
        APIResponse.internalError(res, error?.message ?? "Failed to validate MPPT")
    }
}
