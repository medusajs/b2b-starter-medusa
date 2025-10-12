/**
 * 🌞 Calculate Solar System Workflow
 * Workflow completo de cálculo solar com persistência automática
 * 
 * Fluxo:
 * 1. Fetch Geographic Data (CEP/UF)
 * 2. Fetch ANEEL Tariff (Concessionária)
 * 3. Perform Solar Calculation (Dimensionamento + Kits)
 * 4. Recommend Kits (Catálogo YSH)
 * 5. Save Solar Calculation (Persistência)
 * 6. Link to Quote (Opcional)
 */

import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/workflows-sdk"
import { SolarCalculationInput, SolarCalculationOutput } from "../../modules/solar/services/calculator"
import { SolarCalculation, SolarCalculationKit } from "../../entities/solar-calculation.entity"

// ============================================================================
// Types
// ============================================================================

export interface CalculateSolarSystemInput extends SolarCalculationInput {
    customer_id: string
    quote_id?: string
    save_to_database?: boolean // Default: true
}

export interface CalculateSolarSystemOutput {
    calculation: SolarCalculationOutput
    calculation_id?: string
    quote_id?: string
    saved: boolean
}

// ============================================================================
// Step 1: Fetch Geographic Data
// ============================================================================

interface GeographicData {
    municipio: string
    uf: string
    latitude: number
    longitude: number
    irradiancia_ghi: number
    temperatura_media: number
}

export const fetchGeographicDataStep = createStep(
    "fetch-geographic-data",
    async (input: { cep?: string; uf: string; municipio?: string }) => {
        // Se já tem lat/long ou município, usa diretamente
        if (input.municipio) {
            return new StepResponse({
                municipio: input.municipio,
                uf: input.uf,
                latitude: -23.55, // Fallback São Paulo
                longitude: -46.63,
                irradiancia_ghi: 5.2,
                temperatura_media: 22
            } as GeographicData)
        }

        // TODO: Integrar com API de CEP (ViaCEP ou similar)
        // TODO: Integrar com NASA POWER API ou INPE para dados solares

        // Fallback com dados médios do estado
        const irradianciaPorEstado: Record<string, number> = {
            'SP': 5.0, 'RJ': 5.0, 'MG': 5.4, 'BA': 5.8, 'RS': 4.7,
            'PR': 4.9, 'SC': 4.6, 'CE': 5.7, 'PE': 5.7, 'GO': 5.5
        }

        return new StepResponse({
            municipio: input.municipio || "Unknown",
            uf: input.uf,
            latitude: -15.79, // Centro do Brasil
            longitude: -47.89,
            irradiancia_ghi: irradianciaPorEstado[input.uf] || 5.2,
            temperatura_media: 24
        } as GeographicData)
    }
)

// ============================================================================
// Step 2: Fetch ANEEL Tariff
// ============================================================================

interface TariffData {
    tarifa_energia_kwh: number
    tarifa_fio_b_kwh: number
    concessionaria: string
    modalidade: string
}

export const fetchAneelTariffStep = createStep(
    "fetch-aneel-tariff",
    async (input: { uf: string; municipio?: string }) => {
        // TODO: Buscar tarifa real do banco de dados ANEEL
        // Query: SELECT * FROM aneel_tariffs WHERE uf = ? AND modalidade = 'B1'

        const tarifasPorEstado: Record<string, number> = {
            'SP': 0.82, 'RJ': 0.88, 'MG': 0.80, 'BA': 0.73, 'RS': 0.79,
            'PR': 0.78, 'SC': 0.75, 'CE': 0.78, 'PE': 0.81, 'GO': 0.72
        }

        return new StepResponse({
            tarifa_energia_kwh: tarifasPorEstado[input.uf] || 0.75,
            tarifa_fio_b_kwh: 0.15,
            concessionaria: `Concessionária ${input.uf}`,
            modalidade: "B1 - Residencial"
        } as TariffData)
    }
)

// ============================================================================
// Step 3: Perform Solar Calculation
// ============================================================================

export const performSolarCalculationStep = createStep(
    "perform-solar-calculation",
    async (input: {
        calculationInput: SolarCalculationInput
        geoData: GeographicData
        tariffData: TariffData
    }) => {
        const { calculationInput, geoData, tariffData } = input

        // Enriquecer input com dados obtidos
        const enrichedInput: SolarCalculationInput = {
            ...calculationInput,
            latitude: geoData.latitude,
            longitude: geoData.longitude,
            municipio: geoData.municipio,
            tarifa_energia_kwh: tariffData.tarifa_energia_kwh
        }

        // Importar e executar o service
        const { SolarCalculatorService } = await import("../../modules/solar/services/calculator.js")
        const calculatorService = new SolarCalculatorService()

        const calculation = await calculatorService.calculate(enrichedInput)

        return new StepResponse(calculation)
    }
)

// ============================================================================
// Step 4: Recommend Kits (Already included in calculation)
// ============================================================================

export const recommendKitsStep = createStep(
    "recommend-kits",
    async (input: { calculation: SolarCalculationOutput; maxKits?: number }) => {
        // Os kits já foram recomendados no cálculo, mas podemos filtrar/ordenar
        const topKits = input.calculation.kits_recomendados
            .sort((a, b) => b.match_score - a.match_score)
            .slice(0, input.maxKits || 5)

        return new StepResponse({
            recommended_kits: topKits,
            best_match: topKits[0]
        })
    }
)

// ============================================================================
// Step 5: Save Solar Calculation
// ============================================================================

export const saveSolarCalculationStep = createStep(
    "save-solar-calculation",
    async (input: {
        calculation: SolarCalculationOutput
        calculationInput: SolarCalculationInput
        customer_id: string
        quote_id?: string
    }, { container }) => {
        const entityManager = container.resolve("entityManager") as any

        // Create SolarCalculation entity
        const solarCalc = new SolarCalculation()
        solarCalc.customer_id = input.customer_id
        solarCalc.quote_id = input.quote_id

        // Input data (from workflow input, not calculation output)
        solarCalc.consumo_kwh_mes = input.calculationInput.consumo_kwh_mes
        solarCalc.uf = input.calculationInput.uf
        solarCalc.cep = input.calculationInput.cep
        solarCalc.tipo_telhado = input.calculationInput.tipo_telhado || 'ceramico'
        solarCalc.oversizing_target = input.calculationInput.oversizing_target || 1.2

        // Geographic data from calculation output
        solarCalc.latitude = input.calculationInput.latitude
        solarCalc.longitude = input.calculationInput.longitude
        solarCalc.irradiacao_media_kwh_m2_dia = input.calculation.dados_localizacao.irradiancia_ghi_kwh_m2_dia
        solarCalc.concessionaria = input.calculationInput.uf // Use state as fallback

        // Technical dimensioning
        solarCalc.potencia_instalada_kwp = input.calculation.dimensionamento.kwp_proposto
        solarCalc.numero_modulos = input.calculation.dimensionamento.numero_paineis
        solarCalc.numero_inversores = 1 // Estimate from inverter power
        solarCalc.area_necessaria_m2 = input.calculation.dimensionamento.area_necessaria_m2
        solarCalc.geracao_anual_kwh = input.calculation.dimensionamento.geracao_anual_kwh

        // Financial analysis
        solarCalc.investimento_total = input.calculation.financeiro.capex.total_brl
        solarCalc.economia_mensal = input.calculation.financeiro.economia.mensal_brl
        solarCalc.economia_anual = input.calculation.financeiro.economia.anual_brl
        solarCalc.payback_anos = input.calculation.financeiro.retorno.payback_simples_anos
        solarCalc.economia_25_anos = input.calculation.financeiro.economia.total_25anos_brl
        solarCalc.tir_percent = input.calculation.financeiro.retorno.tir_percentual
        solarCalc.vpl = input.calculation.financeiro.retorno.vpl_brl

        // Environmental impact (convert tons to kg)
        solarCalc.co2_evitado_kg_ano = input.calculation.impacto_ambiental.co2_evitado_ton_ano * 1000
        solarCalc.arvores_equivalentes = input.calculation.impacto_ambiental.arvores_equivalentes

        // Metadata - store full calculation
        solarCalc.calculation_metadata = input.calculation as any
        solarCalc.status = 'completed'

        await entityManager.persistAndFlush(solarCalc)

        // Create SolarCalculationKit entities (CRITICAL for PLG: expose products!)
        const kits = input.calculation.kits_recomendados || []
        const savedKits: any[] = []

        for (let i = 0; i < Math.min(kits.length, 5); i++) {
            const kit = kits[i]
            const kitEntity = new SolarCalculationKit()

            kitEntity.calculation_id = solarCalc.id
            kitEntity.product_id = kit.kit_id // Use kit_id as product reference
            kitEntity.match_score = kit.match_score
            kitEntity.rank = i + 1
            kitEntity.price = kit.preco_brl
            kitEntity.currency_code = 'BRL'
            kitEntity.kit_details = kit as any // Store full kit data

            await entityManager.persist(kitEntity)
            savedKits.push({
                id: kitEntity.id,
                product_id: kitEntity.product_id,
                rank: kitEntity.rank,
                match_score: kitEntity.match_score,
                price: kitEntity.price
            })
        }

        await entityManager.flush()

        console.log(`💾 Solar calculation saved: ${solarCalc.id}`)
        console.log(`   Customer: ${input.customer_id}`)
        console.log(`   Quote: ${input.quote_id || 'N/A'}`)
        console.log(`   System: ${solarCalc.potencia_instalada_kwp.toFixed(2)} kWp`)
        console.log(`   Generation: ${solarCalc.geracao_anual_kwh.toFixed(0)} kWh/year`)
        console.log(`   Investment: R$ ${solarCalc.investimento_total.toFixed(2)}`)
        console.log(`   Payback: ${solarCalc.payback_anos.toFixed(1)} years`)
        console.log(`   🎯 Kits saved: ${savedKits.length} (with product_id for PLG exposure)`)

        return new StepResponse({
            calculation_id: solarCalc.id,
            saved: true,
            kits_saved: savedKits // RETURN product references for storefront
        })
    },
    async (output, { container }) => {
        // Compensação: deletar registro se workflow falhar
        console.log(`🔄 Rollback: Deleting solar calculation ${output.calculation_id}`)

        const entityManager = container.resolve("entityManager") as any
        const calc = await entityManager.findOne(SolarCalculation, output.calculation_id)

        if (calc) {
            await entityManager.removeAndFlush(calc) // CASCADE delete kits
        }
    }
)// ============================================================================
// Step 6: Link to Quote (Optional)
// ============================================================================

export const linkCalculationToQuoteStep = createStep(
    "link-calculation-to-quote",
    async (input: { calculation_id: string; quote_id?: string }) => {
        if (!input.quote_id) {
            return new StepResponse({ linked: false })
        }

        // TODO: Criar RemoteLink entre solar_calculation e quote
        console.log(`🔗 Linking calculation ${input.calculation_id} to quote ${input.quote_id}`)

        return new StepResponse({ linked: true, quote_id: input.quote_id })
    }
)

// ============================================================================
// Workflow: Calculate Solar System
// ============================================================================

export const calculateSolarSystemWorkflow = createWorkflow(
    "calculate-solar-system",
    function (input: CalculateSolarSystemInput): WorkflowResponse<CalculateSolarSystemOutput> {
        // Step 1: Fetch Geographic Data
        const geoData = fetchGeographicDataStep({
            cep: input.cep,
            uf: input.uf,
            municipio: input.municipio
        })

        // Step 2: Fetch ANEEL Tariff
        const tariffData = fetchAneelTariffStep({
            uf: input.uf,
            municipio: input.municipio
        })

        // Step 3: Perform Solar Calculation
        const calculation = performSolarCalculationStep({
            calculationInput: input,
            geoData,
            tariffData
        })

        // Step 4: Recommend Kits (optional refinement)
        const kits = recommendKitsStep({
            calculation,
            maxKits: 5
        })

        // Step 5: Save to Database (if enabled)
        const saveResult = input.save_to_database !== false
            ? saveSolarCalculationStep({
                calculation,
                calculationInput: input,
                customer_id: input.customer_id,
                quote_id: input.quote_id
            })
            : { calculation_id: undefined, saved: false }

        // Step 6: Link to Quote (if quote_id provided)
        const linkResult = linkCalculationToQuoteStep({
            calculation_id: saveResult.calculation_id || "",
            quote_id: input.quote_id
        })

        return new WorkflowResponse({
            calculation,
            calculation_id: saveResult.calculation_id,
            quote_id: (linkResult as any).quote_id || input.quote_id,
            saved: saveResult.saved
        })
    }
)
