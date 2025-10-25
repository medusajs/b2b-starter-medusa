import PVLibIntegrationService from "../../pvlib-integration/service"
import BACENFinancingService from "../../financing/bacen-service"
import ANEELTariffService from "../../aneel-tariff/service"
import { spawn } from "child_process"
import * as path from "path"

/**
 * Viability.pv Agent - Hélio Copiloto Solar
 * 
 * Integra PVLib + BACEN + ANEEL para simulações completas de viabilidade
 * usando ModelChain do pvlib-python para cálculos precisos de geração.
 */

export interface LocationData {
    latitude: number
    longitude: number
    uf: string
    altitude?: number
    timezone?: string
}

export interface SystemConfig {
    inverter_id: string
    panel_id: string
    modules_per_string: number
    strings: number
    surface_tilt?: number  // Default: latitude
    surface_azimuth?: number  // Default: 0 (Norte, hemisfério sul)
    losses?: {
        soiling?: number  // Default: 0.03 (3%)
        shading?: number  // Default: 0.0
        snow?: number     // Default: 0.0
        mismatch?: number // Default: 0.02
        wiring?: number   // Default: 0.02
        connections?: number  // Default: 0.005
        lid?: number      // Light-induced degradation, default: 0.015
        nameplate?: number  // Default: 0.01
        age?: number      // Default: 0.0
        availability?: number  // Default: 0.03
    }
}

export interface FinancialConfig {
    investment: number  // Total CAPEX (BRL)
    periods: number     // Financing periods (months)
    system?: "SAC" | "PRICE"
    spread?: number     // Additional spread over SELIC (default: 3.5%)
    annual_rate?: number  // Override automatic rate calculation
}

export interface ConsumptionData {
    monthly_kwh: number
    grupo?: "B1" | "B2" | "B3" | "A4"
    bandeira?: "verde" | "amarela" | "vermelha_1" | "vermelha_2"
}

export interface EnergyResult {
    annual_generation_kwh: number
    monthly_avg_kwh: number
    monthly_generation: number[]  // 12 months
    performance_ratio: number
    specific_yield: number  // kWh/kWp/year
    capacity_factor: number
    system_size_kwp: number
}

export interface FinancialResult {
    annual_savings: number
    monthly_savings: number
    payback_years: number
    roi_percent: number  // Over financing period
    irr_percent: number  // Internal Rate of Return (TIR)
    npv: number  // Net Present Value (VPL)
    financing_simulation: any
    savings_breakdown: {
        current_annual_cost: number
        new_annual_cost: number
        avoided_cost: number
    }
}

export interface ViabilityReport {
    success: boolean
    energy: EnergyResult
    financial: FinancialResult
    mppt_validation: any
    tariff_info: any
    warnings: string[]
    errors: string[]
    metadata: {
        calculated_at: string
        calculation_time_ms: number
        pvlib_version?: string
    }
}

class ViabilityCalculatorService {
    private pvlibService: PVLibIntegrationService
    private bacenService: BACENFinancingService
    private aneelService: ANEELTariffService

    constructor() {
        this.pvlibService = new PVLibIntegrationService()
        this.bacenService = new BACENFinancingService()
        this.aneelService = new ANEELTariffService()
    }

    /**
     * Calcula viabilidade completa do sistema solar
     */
    async calculateViability(
        location: LocationData,
        system: SystemConfig,
        financial: FinancialConfig,
        consumption: ConsumptionData
    ): Promise<ViabilityReport> {
        const startTime = Date.now()
        const warnings: string[] = []
        const errors: string[] = []

        try {
            // 1. Validar MPPT
            const inverter = await this.pvlibService.getInverterById(system.inverter_id)
            const panel = await this.pvlibService.getPanelById(system.panel_id)

            if (!inverter || !panel) {
                throw new Error(`Equipamento não encontrado: ${!inverter ? 'inverter' : 'panel'}`)
            }

            const mpptValidation = this.pvlibService.validateMPPT(
                inverter,
                panel,
                system.modules_per_string
            )

            if (!mpptValidation.compatible) {
                errors.push(`String incompatível com MPPT: ${mpptValidation.v_string_min.toFixed(1)}V-${mpptValidation.v_string_max.toFixed(1)}V fora de ${mpptValidation.v_mppt_low}V-${mpptValidation.v_mppt_high}V`)
            }

            if (mpptValidation.warnings.length > 0) {
                warnings.push(...mpptValidation.warnings)
            }

            // 2. Simular geração com ModelChain
            const energyResult = await this.simulateEnergyProduction(
                location,
                system,
                inverter,
                panel
            )

            // 3. Buscar tarifa ANEEL
            const tariffInfo = this.aneelService.getTariffByUF(location.uf, consumption.grupo)

            if (!tariffInfo) {
                throw new Error(`Tarifa não encontrada para UF: ${location.uf}`)
            }

            // 4. Calcular economia
            const savingsResult = this.aneelService.calculateSolarSavings(
                consumption.monthly_kwh,
                energyResult.monthly_avg_kwh,
                location.uf,
                consumption.grupo
            )

            // 5. Simular financiamento
            const financingRate = financial.annual_rate ??
                await this.bacenService.getSolarFinancingRate(financial.spread ?? 3.5)

            let financingSimulation
            if (financial.system === "PRICE") {
                financingSimulation = this.bacenService.simulatePrice(
                    financial.investment,
                    financingRate,
                    financial.periods
                )
            } else {
                financingSimulation = this.bacenService.simulateSAC(
                    financial.investment,
                    financingRate,
                    financial.periods
                )
            }

            // 6. Calcular ROI e TIR
            const monthlyPayment = financingSimulation.summary.average_payment
            const monthlySavings = savingsResult.annual_savings / 12
            const netMonthlySavings = monthlySavings - monthlyPayment

            // Payback considerando financiamento
            const paybackYears = financial.investment / savingsResult.annual_savings

            // ROI sobre período de financiamento
            const totalSavings = savingsResult.annual_savings * (financial.periods / 12)
            const totalPaid = financingSimulation.summary.total_paid
            const roi = ((totalSavings - totalPaid) / financial.investment) * 100

            // TIR (Taxa Interna de Retorno) - aproximação simples
            const irr = this.calculateIRR(
                financial.investment,
                savingsResult.annual_savings,
                25  // Vida útil típica do sistema
            )

            // VPL (Valor Presente Líquido)
            const npv = this.calculateNPV(
                financial.investment,
                savingsResult.annual_savings,
                financingRate / 100,
                25
            )

            const financialResult: FinancialResult = {
                annual_savings: savingsResult.annual_savings,
                monthly_savings: monthlySavings,
                payback_years: paybackYears,
                roi_percent: roi,
                irr_percent: irr,
                npv: npv,
                financing_simulation: {
                    ...financingSimulation,
                    monthly_payment: monthlyPayment,
                    net_monthly_cash_flow: netMonthlySavings
                },
                savings_breakdown: {
                    current_annual_cost: savingsResult.current_annual_cost,
                    new_annual_cost: savingsResult.new_annual_cost,
                    avoided_cost: savingsResult.annual_savings
                }
            }

            return {
                success: true,
                energy: energyResult,
                financial: financialResult,
                mppt_validation: mpptValidation,
                tariff_info: tariffInfo,
                warnings,
                errors,
                metadata: {
                    calculated_at: new Date().toISOString(),
                    calculation_time_ms: Date.now() - startTime
                }
            }

        } catch (error) {
            errors.push(error.message)

            return {
                success: false,
                energy: null,
                financial: null,
                mppt_validation: null,
                tariff_info: null,
                warnings,
                errors,
                metadata: {
                    calculated_at: new Date().toISOString(),
                    calculation_time_ms: Date.now() - startTime
                }
            }
        }
    }

    /**
     * Simula geração de energia usando ModelChain do pvlib-python
     * 
     * Duas opções de implementação:
     * A) Python subprocess (recomendado - usa pvlib.modelchain.ModelChain)
     * B) Fórmulas simplificadas em TypeScript (fallback)
     */
    private async simulateEnergyProduction(
        location: LocationData,
        system: SystemConfig,
        inverter: any,
        panel: any
    ): Promise<EnergyResult> {

        // Calcular potência do sistema
        const system_size_kwp = (panel.technical_specs.power_w * system.modules_per_string * system.strings) / 1000

        try {
            // Tentar usar Python subprocess
            const result = await this.runPythonModelChain(location, system, inverter, panel)

            return {
                ...result,
                system_size_kwp,
                specific_yield: result.annual_generation_kwh / system_size_kwp
            }
        } catch (error) {
            console.warn("Python ModelChain failed, using simplified calculation:", error.message)

            // Fallback: cálculo simplificado
            return this.calculateSimplifiedGeneration(location, system, panel, system_size_kwp)
        }
    }

    /**
     * Executa pvlib.modelchain via Python subprocess
     */
    private runPythonModelChain(
        location: LocationData,
        system: SystemConfig,
        inverter: any,
        panel: any
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(__dirname, "../../../../scripts/pvlib_modelchain.py")

            const input = {
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    altitude: location.altitude ?? 0,
                    timezone: location.timezone ?? "America/Sao_Paulo"
                },
                system: {
                    surface_tilt: system.surface_tilt ?? location.latitude,
                    surface_azimuth: system.surface_azimuth ?? 0,
                    modules_per_string: system.modules_per_string,
                    strings_per_inverter: system.strings,
                    inverter_parameters: inverter.sandia_params,
                    module_parameters: panel.cec_params
                },
                losses: system.losses ?? {}
            }

            const pythonProcess = spawn("python", [scriptPath, JSON.stringify(input)], {
                timeout: 60000  // 60s timeout
            })

            let stdout = ""
            let stderr = ""

            pythonProcess.stdout.on("data", (data) => {
                stdout += data.toString()
            })

            pythonProcess.stderr.on("data", (data) => {
                stderr += data.toString()
            })

            pythonProcess.on("close", (code) => {
                if (code !== 0) {
                    reject(new Error(`Python process failed: ${stderr}`))
                    return
                }

                try {
                    const result = JSON.parse(stdout)
                    resolve(result)
                } catch (error) {
                    reject(new Error(`Failed to parse Python output: ${stdout}`))
                }
            })

            pythonProcess.on("error", (error) => {
                reject(new Error(`Failed to spawn Python process: ${error.message}`))
            })
        })
    }

    /**
     * Cálculo simplificado de geração (fallback quando Python não disponível)
     * Baseado em HSP (Horas de Sol Pleno) médias por região brasileira
     */
    private calculateSimplifiedGeneration(
        location: LocationData,
        system: SystemConfig,
        panel: any,
        system_size_kwp: number
    ): EnergyResult {
        // HSP médio por região (kWh/m²/dia)
        const hspByRegion: Record<string, number> = {
            "AC": 4.5, "AL": 5.2, "AP": 4.8, "AM": 4.6, "BA": 5.5, "CE": 5.6,
            "DF": 5.3, "ES": 5.0, "GO": 5.4, "MA": 5.0, "MT": 5.5, "MS": 5.3,
            "MG": 5.2, "PA": 4.8, "PB": 5.5, "PR": 4.8, "PE": 5.4, "PI": 5.3,
            "RJ": 4.9, "RN": 5.6, "RS": 4.7, "RO": 4.6, "RR": 4.9, "SC": 4.6,
            "SP": 5.0, "SE": 5.3, "TO": 5.2
        }

        const hsp = hspByRegion[location.uf.toUpperCase()] ?? 5.0

        // Performance Ratio típico (0.75-0.85 para sistemas bem dimensionados)
        const pr_base = 0.80

        // Ajustes de perdas
        const losses = system.losses ?? {}
        const totalLosses = (losses.soiling ?? 0.03) +
            (losses.shading ?? 0.0) +
            (losses.mismatch ?? 0.02) +
            (losses.wiring ?? 0.02) +
            (losses.connections ?? 0.005) +
            (losses.lid ?? 0.015) +
            (losses.nameplate ?? 0.01) +
            (losses.availability ?? 0.03)

        const pr = pr_base * (1 - totalLosses)

        // Geração anual (kWh) = Potência (kWp) × HSP × 365 × PR
        const annual_generation_kwh = system_size_kwp * hsp * 365 * pr

        // Distribuição mensal (aproximada por região - variação sazonal)
        const monthly_factors = this.getMonthlyFactors(location.uf)
        const monthly_generation = monthly_factors.map(factor =>
            (annual_generation_kwh / 12) * factor
        )

        const capacity_factor = (annual_generation_kwh / (system_size_kwp * 8760)) * 100

        return {
            annual_generation_kwh,
            monthly_avg_kwh: annual_generation_kwh / 12,
            monthly_generation,
            performance_ratio: pr,
            specific_yield: annual_generation_kwh / system_size_kwp,
            capacity_factor,
            system_size_kwp
        }
    }

    /**
     * Fatores mensais de geração por região (variação sazonal)
     * Base: 1.0 = média anual
     */
    private getMonthlyFactors(uf: string): number[] {
        // Sudeste/Centro-Oeste (maior geração verão)
        const sudesteFactors = [1.15, 1.10, 1.05, 0.95, 0.90, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15]

        // Nordeste (menor variação sazonal)
        const nordesteFactors = [1.08, 1.05, 1.02, 1.00, 0.98, 0.95, 0.95, 0.98, 1.00, 1.02, 1.05, 1.08]

        // Sul (maior variação, inverno mais fraco)
        const sulFactors = [1.20, 1.15, 1.10, 1.00, 0.85, 0.75, 0.80, 0.85, 0.95, 1.05, 1.15, 1.20]

        const nordeste = ["BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE", "AL"]
        const sul = ["RS", "SC", "PR"]

        if (nordeste.includes(uf.toUpperCase())) {
            return nordesteFactors
        } else if (sul.includes(uf.toUpperCase())) {
            return sulFactors
        } else {
            return sudesteFactors
        }
    }

    /**
     * Calcula TIR (Taxa Interna de Retorno)
     * Aproximação usando método de Newton-Raphson
     */
    private calculateIRR(investment: number, annual_cash_flow: number, years: number): number {
        let irr = 0.1  // Chute inicial 10%
        const tolerance = 0.0001
        const maxIterations = 100

        for (let i = 0; i < maxIterations; i++) {
            let npv = -investment
            let npv_derivative = 0

            for (let year = 1; year <= years; year++) {
                npv += annual_cash_flow / Math.pow(1 + irr, year)
                npv_derivative -= (year * annual_cash_flow) / Math.pow(1 + irr, year + 1)
            }

            if (Math.abs(npv) < tolerance) {
                return irr * 100  // Retorna em percentual
            }

            irr = irr - npv / npv_derivative
        }

        return irr * 100
    }

    /**
     * Calcula VPL (Valor Presente Líquido)
     */
    private calculateNPV(
        investment: number,
        annual_cash_flow: number,
        discount_rate: number,
        years: number
    ): number {
        let npv = -investment

        for (let year = 1; year <= years; year++) {
            npv += annual_cash_flow / Math.pow(1 + discount_rate, year)
        }

        return npv
    }
}

export default ViabilityCalculatorService
