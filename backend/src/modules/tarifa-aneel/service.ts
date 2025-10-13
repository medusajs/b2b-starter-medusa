/**
 * ANEEL Tariff Service
 * Serviço para buscar tarifas das concessionárias elétricas brasileiras
 * Fonte: Portal de dados ANEEL (manual - aguardando API oficial)
 */

export interface TariffData {
    concessionaria: string
    uf: string
    grupo: "B1" | "B2" | "B3" | "A4" // B1: Residencial, B2: Rural, B3: Outros, A4: Comercial/Industrial
    tarifa_kwh: number
    tarifa_tusd: number  // Tarifa de Uso do Sistema de Distribuição
    tarifa_te: number    // Tarifa de Energia
    bandeira: {
        verde: number
        amarela: number
        vermelha_1: number
        vermelha_2: number
    }
    vigencia: string
    updated_at: string
}

export interface ConcessionariaInfo {
    nome: string
    sigla: string
    uf: string[]
    website?: string
}

class ANEELTariffService {
    // Dados estáticos das principais concessionárias (2024/2025)
    // TODO: Integrar com API oficial da ANEEL quando disponível
    private readonly TARIFAS_BASE: TariffData[] = [
        {
            concessionaria: "CPFL Paulista",
            uf: "SP",
            grupo: "B1",
            tarifa_kwh: 0.72,
            tarifa_tusd: 0.42,
            tarifa_te: 0.30,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        },
        {
            concessionaria: "Enel SP",
            uf: "SP",
            grupo: "B1",
            tarifa_kwh: 0.68,
            tarifa_tusd: 0.39,
            tarifa_te: 0.29,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        },
        {
            concessionaria: "Light",
            uf: "RJ",
            grupo: "B1",
            tarifa_kwh: 0.89,
            tarifa_tusd: 0.51,
            tarifa_te: 0.38,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        },
        {
            concessionaria: "Enel RJ",
            uf: "RJ",
            grupo: "B1",
            tarifa_kwh: 0.85,
            tarifa_tusd: 0.49,
            tarifa_te: 0.36,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        },
        {
            concessionaria: "CEMIG",
            uf: "MG",
            grupo: "B1",
            tarifa_kwh: 0.78,
            tarifa_tusd: 0.45,
            tarifa_te: 0.33,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        },
        {
            concessionaria: "Copel",
            uf: "PR",
            grupo: "B1",
            tarifa_kwh: 0.62,
            tarifa_tusd: 0.36,
            tarifa_te: 0.26,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        },
        {
            concessionaria: "Celesc",
            uf: "SC",
            grupo: "B1",
            tarifa_kwh: 0.65,
            tarifa_tusd: 0.38,
            tarifa_te: 0.27,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        },
        {
            concessionaria: "RGE Sul",
            uf: "RS",
            grupo: "B1",
            tarifa_kwh: 0.70,
            tarifa_tusd: 0.41,
            tarifa_te: 0.29,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        },
        {
            concessionaria: "Coelba",
            uf: "BA",
            grupo: "B1",
            tarifa_kwh: 0.76,
            tarifa_tusd: 0.44,
            tarifa_te: 0.32,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        },
        {
            concessionaria: "Celpe",
            uf: "PE",
            grupo: "B1",
            tarifa_kwh: 0.74,
            tarifa_tusd: 0.43,
            tarifa_te: 0.31,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        },
        {
            concessionaria: "Celg-D",
            uf: "GO",
            grupo: "B1",
            tarifa_kwh: 0.69,
            tarifa_tusd: 0.40,
            tarifa_te: 0.29,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        },
        {
            concessionaria: "Enel CE",
            uf: "CE",
            grupo: "B1",
            tarifa_kwh: 0.73,
            tarifa_tusd: 0.42,
            tarifa_te: 0.31,
            bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
            vigencia: "2024-07",
            updated_at: new Date().toISOString()
        }
    ]

    private readonly CONCESSIONARIAS: ConcessionariaInfo[] = [
        { nome: "CPFL Paulista", sigla: "CPFL", uf: ["SP"] },
        { nome: "Enel Distribuição São Paulo", sigla: "ENEL-SP", uf: ["SP"] },
        { nome: "Light", sigla: "LIGHT", uf: ["RJ"] },
        { nome: "Enel Distribuição Rio", sigla: "ENEL-RJ", uf: ["RJ"] },
        { nome: "CEMIG Distribuição", sigla: "CEMIG", uf: ["MG"] },
        { nome: "Copel Distribuição", sigla: "COPEL", uf: ["PR"] },
        { nome: "Celesc Distribuição", sigla: "CELESC", uf: ["SC"] },
        { nome: "RGE Sul", sigla: "RGE", uf: ["RS"] },
        { nome: "Coelba", sigla: "COELBA", uf: ["BA"] },
        { nome: "Celpe", sigla: "CELPE", uf: ["PE"] },
        { nome: "Celg Distribuição", sigla: "CELG-D", uf: ["GO", "DF"] },
        { nome: "Enel Distribuição Ceará", sigla: "ENEL-CE", uf: ["CE"] }
    ]

    private cache: Map<string, { data: TariffData; timestamp: number }> = new Map()
    private readonly CACHE_TTL = 1000 * 60 * 60 * 24 // 24 horas

    /**
     * Busca tarifa por UF e grupo tarifário
     */
    getTariffByUF(uf: string, grupo: TariffData["grupo"] = "B1"): TariffData | null {
        const cacheKey = `${uf}-${grupo}`
        const cached = this.getFromCache(cacheKey)
        if (cached) return cached

        const tarifa = this.TARIFAS_BASE.find(t => t.uf === uf.toUpperCase() && t.grupo === grupo)

        if (tarifa) {
            this.setCache(cacheKey, tarifa)
            return tarifa
        }

        // Fallback: média nacional para grupo B1
        if (grupo === "B1") {
            const mediaNacional: TariffData = {
                concessionaria: "Média Nacional",
                uf: uf.toUpperCase(),
                grupo: "B1",
                tarifa_kwh: 0.72,
                tarifa_tusd: 0.42,
                tarifa_te: 0.30,
                bandeira: { verde: 0, amarela: 0.02, vermelha_1: 0.04, vermelha_2: 0.06 },
                vigencia: "2024-07",
                updated_at: new Date().toISOString()
            }
            return mediaNacional
        }

        return null
    }

    /**
     * Lista todas concessionárias disponíveis
     */
    listConcessionarias(): ConcessionariaInfo[] {
        return this.CONCESSIONARIAS
    }

    /**
     * Busca concessionária por UF
     */
    getConcessionariasByUF(uf: string): ConcessionariaInfo[] {
        return this.CONCESSIONARIAS.filter(c =>
            c.uf.includes(uf.toUpperCase())
        )
    }

    /**
     * Calcula custo anual de energia
     */
    calculateAnnualCost(
        monthlyConsumptionKWh: number,
        uf: string,
        grupo: TariffData["grupo"] = "B1",
        bandeiraMedia: "verde" | "amarela" | "vermelha_1" | "vermelha_2" = "amarela"
    ): {
        annual_cost: number
        monthly_average: number
        tariff_used: TariffData
        breakdown: {
            energy: number
            distribution: number
            bandeira: number
        }
    } {
        const tariff = this.getTariffByUF(uf, grupo)

        if (!tariff) {
            throw new Error(`Tarifa não encontrada para UF: ${uf}, Grupo: ${grupo}`)
        }

        const bandeiraCost = tariff.bandeira[bandeiraMedia]
        const monthlyCost = monthlyConsumptionKWh * (tariff.tarifa_kwh + bandeiraCost)
        const annualCost = monthlyCost * 12

        return {
            annual_cost: annualCost,
            monthly_average: monthlyCost,
            tariff_used: tariff,
            breakdown: {
                energy: monthlyConsumptionKWh * tariff.tarifa_te * 12,
                distribution: monthlyConsumptionKWh * tariff.tarifa_tusd * 12,
                bandeira: monthlyConsumptionKWh * bandeiraCost * 12
            }
        }
    }

    /**
     * Calcula economia com sistema solar
     */
    calculateSolarSavings(
        monthlyConsumptionKWh: number,
        systemGenerationKWh: number,
        uf: string,
        grupo: TariffData["grupo"] = "B1"
    ): {
        current_annual_cost: number
        new_annual_cost: number
        annual_savings: number
        savings_percentage: number
        payback_years: number
        system_cost_estimate: number
    } {
        const currentCost = this.calculateAnnualCost(monthlyConsumptionKWh, uf, grupo)

        // Consumo residual (considerando que sistema não cobre 100%)
        const residualConsumption = Math.max(0, monthlyConsumptionKWh - systemGenerationKWh)
        const newCost = this.calculateAnnualCost(residualConsumption, uf, grupo)

        const annualSavings = currentCost.annual_cost - newCost.annual_cost
        const savingsPercentage = (annualSavings / currentCost.annual_cost) * 100

        // Estimativa de custo do sistema (R$ 4,50/W instalado em média)
        const systemSizeKWp = (systemGenerationKWh * 12) / 1500 // 1500 kWh/kWp/ano média Brasil
        const systemCostEstimate = systemSizeKWp * 1000 * 4.5

        const paybackYears = systemCostEstimate / annualSavings

        return {
            current_annual_cost: currentCost.annual_cost,
            new_annual_cost: newCost.annual_cost,
            annual_savings: annualSavings,
            savings_percentage: savingsPercentage,
            payback_years: paybackYears,
            system_cost_estimate: systemCostEstimate
        }
    }

    /**
     * Cache helpers
     */
    private getFromCache(key: string): TariffData | null {
        const cached = this.cache.get(key)
        if (!cached) return null

        const now = Date.now()
        if (now - cached.timestamp > this.CACHE_TTL) {
            this.cache.delete(key)
            return null
        }

        return cached.data
    }

    private setCache(key: string, data: TariffData): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        })
    }

    clearCache(): void {
        this.cache.clear()
    }

    /**
     * Lista todas as tarifas disponíveis
     */
    getAllTariffs(): TariffData[] {
        return this.TARIFAS_BASE
    }
}

export default ANEELTariffService
