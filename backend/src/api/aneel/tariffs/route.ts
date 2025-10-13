import type { MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { GetTariffsQuerySchema } from "../../../modules/aneel-tariff/validators"
import { GrupoTarifa, ClasseConsumidor } from "../../../modules/aneel-tariff/types/enums"

/**
 * GET /api/aneel/tariffs
 * Lista tarifas por UF e grupo
 * Query params: uf (required), grupo (optional, default: B1), classe (optional)
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const startTime = Date.now()

    try {
        // Validar query params com Zod
        const validated = GetTariffsQuerySchema.parse(req.query)

        const logger = (req as any).log

        logger?.info("Consultando tarifa ANEEL", {
            uf: validated.uf,
            grupo: validated.grupo,
            classe: validated.classe,
        })

        // TODO: Usar ANEELTariffService refatorado quando integrar MikroORM
        // const aneelService = req.scope.resolve("aneelTariffService")
        // const tariff = await aneelService.getTarifaVigente({
        //     uf: validated.uf,
        //     grupo: validated.grupo as GrupoTarifa,
        //     classe: validated.classe as ClasseConsumidor,
        // })

        // Por ora, usar service legado
        const ANEELTariffService = (await import("../../../modules/aneel-tariff/service")).default
        const aneelService = new ANEELTariffService()
        const tariff = aneelService.getTariffByUF(
            validated.uf,
            validated.grupo as "B1" | "B2" | "B3" | "A4"
        )

        if (!tariff) {
            logger?.warn("Tarifa não encontrada", {
                uf: validated.uf,
                grupo: validated.grupo,
            })

            res.status(404).json({
                error: "Tariff not found for specified UF and group",
                uf: validated.uf,
                grupo: validated.grupo
            })
            return
        }

        const responseTime = Date.now() - startTime

        logger?.info("Tarifa encontrada", {
            uf: validated.uf,
            tarifa_kwh: tariff.tarifa_kwh,
            response_time_ms: responseTime,
        })

        res.json({
            tariff,
            _metadata: {
                response_time_ms: responseTime,
                cached: false, // Será true quando usar Redis
            }
        })
    } catch (error: any) {
        const responseTime = Date.now() - startTime

        if (error.name === "ZodError") {
            const logger = (req as any).log

            logger?.warn("Validação falhou", {
                errors: error.errors,
                response_time_ms: responseTime,
            })

            res.status(400).json({
                error: "Invalid query parameters",
                details: error.errors
            })
            return
        }

        const logger = (req as any).log

        logger?.error("Erro ao buscar tarifa ANEEL", {
            error: error.message,
            stack: error.stack,
            response_time_ms: responseTime,
        })

        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error?.message ?? "Failed to load ANEEL tariff")
    }
}
