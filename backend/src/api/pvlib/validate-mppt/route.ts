import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import PVLibIntegrationService from "../../../modules/pvlib-integration/service"

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
            res.status(400).json({
                error: "Missing required parameters",
                required: ["inverter_id", "panel_id", "modules_per_string"]
            })
            return
        }

        const pvlibService = new PVLibIntegrationService()

        const inverter = await pvlibService.getInverterById(inverter_id)
        const panel = await pvlibService.getPanelById(panel_id)

        if (!inverter) {
            res.status(404).json({ error: "Inverter not found", inverter_id })
            return
        }

        if (!panel) {
            res.status(404).json({ error: "Panel not found", panel_id })
            return
        }

        const validation = pvlibService.validateMPPT(inverter, panel, modules_per_string)

        res.json({
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
    } catch (error) {
        console.error("Error validating MPPT:", error)
        throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message)
    }
}
