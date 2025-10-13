import { AuthenticatedMedusaRequest, MedusaResponse, MedusaError } from "@medusajs/framework"
import ViabilityCalculatorService from "../../../modules/solar/services/viability"

/**
 * POST /api/solar/viability
 * Calcula viabilidade completa de sistema solar fotovoltaico
 * 
 * Integra:
 * - PVLib (validação MPPT + simulação ModelChain)
 * - BACEN (taxas de financiamento)
 * - ANEEL (tarifas das concessionárias)
 */
export async function POST(
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const { location, system, financial, consumption } = req.body as {
            location: {
                latitude: number
                longitude: number
                uf: string
                altitude?: number
                timezone?: string
            }
            system: {
                inverter_id: string
                panel_id: string
                modules_per_string: number
                strings: number
                surface_tilt?: number
                surface_azimuth?: number
                losses?: any
            }
            financial: {
                investment: number
                periods: number
                system?: "SAC" | "PRICE"
                spread?: number
                annual_rate?: number
            }
            consumption: {
                monthly_kwh: number
                grupo?: "B1" | "B2" | "B3" | "A4"
                bandeira?: "verde" | "amarela" | "vermelha_1" | "vermelha_2"
            }
        }

        // Validar inputs obrigatórios
        if (!location || !location.latitude || !location.longitude || !location.uf) {
            res.status(400).json({
                error: "Missing required location parameters",
                required: ["location.latitude", "location.longitude", "location.uf"]
            })
            return
        }

        if (!system || !system.inverter_id || !system.panel_id || !system.modules_per_string || !system.strings) {
            res.status(400).json({
                error: "Missing required system parameters",
                required: ["system.inverter_id", "system.panel_id", "system.modules_per_string", "system.strings"]
            })
            return
        }

        if (!financial || !financial.investment || !financial.periods) {
            res.status(400).json({
                error: "Missing required financial parameters",
                required: ["financial.investment", "financial.periods"]
            })
            return
        }

        if (!consumption || !consumption.monthly_kwh) {
            res.status(400).json({
                error: "Missing required consumption parameters",
                required: ["consumption.monthly_kwh"]
            })
            return
        }

        // Executar cálculo de viabilidade
        const viabilityService = new ViabilityCalculatorService()
        const result = await viabilityService.calculateViability(
            location,
            system,
            financial,
            consumption
        )

        // Retornar resultado
        if (result.success) {
            res.json(result)
        } else {
            throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message)
        }

    } catch (error) {
        console.error("Error calculating viability:", error)
        throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message)
    }
}

/**
 * GET /api/solar/viability/quick
 * Cálculo simplificado rápido (sem ModelChain Python)
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const {
            latitude,
            longitude,
            uf,
            inverter_id,
            panel_id,
            modules_per_string,
            strings,
            monthly_kwh,
            investment,
            periods
        } = req.query

        // Validação básica
        if (!latitude || !longitude || !uf || !inverter_id || !panel_id ||
            !modules_per_string || !strings || !monthly_kwh || !investment || !periods) {
            res.status(400).json({
                error: "Missing required query parameters",
                required: [
                    "latitude", "longitude", "uf", "inverter_id", "panel_id",
                    "modules_per_string", "strings", "monthly_kwh", "investment", "periods"
                ]
            })
            return
        }

        // Construir configuração
        const location = {
            latitude: parseFloat(latitude as string),
            longitude: parseFloat(longitude as string),
            uf: uf as string
        }

        const system = {
            inverter_id: inverter_id as string,
            panel_id: panel_id as string,
            modules_per_string: parseInt(modules_per_string as string),
            strings: parseInt(strings as string)
        }

        const financial = {
            investment: parseFloat(investment as string),
            periods: parseInt(periods as string),
            system: "SAC" as const
        }

        const consumption = {
            monthly_kwh: parseFloat(monthly_kwh as string),
            grupo: "B1" as const
        }

        // Executar cálculo
        const viabilityService = new ViabilityCalculatorService()
        const result = await viabilityService.calculateViability(
            location,
            system,
            financial,
            consumption
        )

        res.json(result)

    } catch (error) {
        console.error("Error in quick viability calculation:", error)
        throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message)
    }
}
