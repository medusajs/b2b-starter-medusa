import axios from "axios"

/**
 * BACEN API Service
 * Integração com APIs do Banco Central do Brasil
 * Fonte: https://olinda.bcb.gov.br/olinda/servico/
 */

export interface SELICRate {
    data: string
    valor: number
}

export interface CDIRate {
    data: string
    valor: number
}

export interface IPCARate {
    data: string
    valor: number
}

export interface FinancingRates {
    selic: {
        rate: number
        date: string
        annual_rate: number
    }
    cdi: {
        rate: number
        date: string
        annual_rate: number
    }
    ipca: {
        rate: number
        date: string
        annual_rate: number
    }
    updated_at: string
}

export interface LoanSimulation {
    principal: number              // Valor principal
    interest_rate: number          // Taxa anual %
    periods: number                // Número de parcelas
    system: "SAC" | "PRICE"       // Sistema de amortização
    payments: {
        period: number
        principal_payment: number
        interest_payment: number
        total_payment: number
        remaining_balance: number
    }[]
    summary: {
        total_paid: number
        total_interest: number
        first_payment: number
        last_payment: number
        average_payment: number
    }
}

class BACENFinancingService {
    private readonly BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.json"

    // Códigos das séries do BACEN
    private readonly SERIES = {
        SELIC: 432,        // Taxa SELIC (% a.a.)
        CDI: 12,           // Taxa CDI (% a.a.)
        IPCA: 433          // IPCA (% mensal)
    }

    private cache: Map<string, { data: any; timestamp: number }> = new Map()
    private readonly CACHE_TTL = 1000 * 60 * 60 * 24 // 24 horas

    /**
     * Busca taxa SELIC mais recente
     */
    async getSELICRate(): Promise<SELICRate> {
        const cacheKey = "selic"
        const cached = this.getFromCache(cacheKey)
        if (cached) return cached

        try {
            // Últimos 1 registro
            const url = `${this.BASE_URL}/${this.SERIES.SELIC}/ultimos/1`
            const response = await axios.get(url, { timeout: 10000 })

            if (response.data && response.data.length > 0) {
                const latest = response.data[0]
                const result = {
                    data: latest.data,
                    valor: parseFloat(latest.valor)
                }
                this.setCache(cacheKey, result)
                return result
            }

            throw new Error("Nenhum dado SELIC retornado")
        } catch (error) {
            console.error("Erro ao buscar SELIC:", error)
            // Fallback: SELIC média 2024
            return { data: new Date().toISOString().split('T')[0], valor: 10.5 }
        }
    }

    /**
     * Busca taxa CDI mais recente
     */
    async getCDIRate(): Promise<CDIRate> {
        const cacheKey = "cdi"
        const cached = this.getFromCache(cacheKey)
        if (cached) return cached

        try {
            const url = `${this.BASE_URL}/${this.SERIES.CDI}/ultimos/1`
            const response = await axios.get(url, { timeout: 10000 })

            if (response.data && response.data.length > 0) {
                const latest = response.data[0]
                const result = {
                    data: latest.data,
                    valor: parseFloat(latest.valor)
                }
                this.setCache(cacheKey, result)
                return result
            }

            throw new Error("Nenhum dado CDI retornado")
        } catch (error) {
            console.error("Erro ao buscar CDI:", error)
            return { data: new Date().toISOString().split('T')[0], valor: 10.15 }
        }
    }

    /**
     * Busca IPCA mais recente
     */
    async getIPCARate(): Promise<IPCARate> {
        const cacheKey = "ipca"
        const cached = this.getFromCache(cacheKey)
        if (cached) return cached

        try {
            const url = `${this.BASE_URL}/${this.SERIES.IPCA}/ultimos/1`
            const response = await axios.get(url, { timeout: 10000 })

            if (response.data && response.data.length > 0) {
                const latest = response.data[0]
                const result = {
                    data: latest.data,
                    valor: parseFloat(latest.valor)
                }
                this.setCache(cacheKey, result)
                return result
            }

            throw new Error("Nenhum dado IPCA retornado")
        } catch (error) {
            console.error("Erro ao buscar IPCA:", error)
            return { data: new Date().toISOString().split('T')[0], valor: 4.5 }
        }
    }

    /**
     * Busca todas as taxas consolidadas
     */
    async getAllRates(): Promise<FinancingRates> {
        const [selic, cdi, ipca] = await Promise.all([
            this.getSELICRate(),
            this.getCDIRate(),
            this.getIPCARate()
        ])

        return {
            selic: {
                rate: selic.valor,
                date: selic.data,
                annual_rate: selic.valor
            },
            cdi: {
                rate: cdi.valor,
                date: cdi.data,
                annual_rate: cdi.valor
            },
            ipca: {
                rate: ipca.valor,
                date: ipca.data,
                annual_rate: ipca.valor * 12 // Aproximação simples
            },
            updated_at: new Date().toISOString()
        }
    }

    /**
     * Simula financiamento usando Sistema SAC
     * (Sistema de Amortização Constante)
     */
    simulateSAC(principal: number, annualRate: number, periods: number): LoanSimulation {
        const monthlyRate = annualRate / 100 / 12
        const constantAmortization = principal / periods

        const payments: LoanSimulation["payments"] = []
        let remainingBalance = principal

        for (let period = 1; period <= periods; period++) {
            const interestPayment = remainingBalance * monthlyRate
            const principalPayment = constantAmortization
            const totalPayment = principalPayment + interestPayment

            remainingBalance -= principalPayment

            payments.push({
                period,
                principal_payment: principalPayment,
                interest_payment: interestPayment,
                total_payment: totalPayment,
                remaining_balance: Math.max(0, remainingBalance)
            })
        }

        const totalPaid = payments.reduce((sum, p) => sum + p.total_payment, 0)
        const totalInterest = totalPaid - principal

        return {
            principal,
            interest_rate: annualRate,
            periods,
            system: "SAC",
            payments,
            summary: {
                total_paid: totalPaid,
                total_interest: totalInterest,
                first_payment: payments[0].total_payment,
                last_payment: payments[periods - 1].total_payment,
                average_payment: totalPaid / periods
            }
        }
    }

    /**
     * Simula financiamento usando Tabela Price
     * (Sistema Francês de Amortização - parcelas fixas)
     */
    simulatePrice(principal: number, annualRate: number, periods: number): LoanSimulation {
        const monthlyRate = annualRate / 100 / 12

        // Fórmula: PMT = PV * (i * (1 + i)^n) / ((1 + i)^n - 1)
        const pmt = principal * (monthlyRate * Math.pow(1 + monthlyRate, periods)) /
            (Math.pow(1 + monthlyRate, periods) - 1)

        const payments: LoanSimulation["payments"] = []
        let remainingBalance = principal

        for (let period = 1; period <= periods; period++) {
            const interestPayment = remainingBalance * monthlyRate
            const principalPayment = pmt - interestPayment

            remainingBalance -= principalPayment

            payments.push({
                period,
                principal_payment: principalPayment,
                interest_payment: interestPayment,
                total_payment: pmt,
                remaining_balance: Math.max(0, remainingBalance)
            })
        }

        const totalPaid = pmt * periods
        const totalInterest = totalPaid - principal

        return {
            principal,
            interest_rate: annualRate,
            periods,
            system: "PRICE",
            payments,
            summary: {
                total_paid: totalPaid,
                total_interest: totalInterest,
                first_payment: pmt,
                last_payment: pmt,
                average_payment: pmt
            }
        }
    }

    /**
     * Calcula taxa efetiva para financiamento solar
     * Base: SELIC + spread de crédito verde
     */
    async getSolarFinancingRate(spreadPct: number = 3.5): Promise<number> {
        const selic = await this.getSELICRate()
        return selic.valor + spreadPct
    }

    /**
     * Cache helpers
     */
    private getFromCache(key: string): any | null {
        const cached = this.cache.get(key)
        if (!cached) return null

        const now = Date.now()
        if (now - cached.timestamp > this.CACHE_TTL) {
            this.cache.delete(key)
            return null
        }

        return cached.data
    }

    private setCache(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        })
    }

    clearCache(): void {
        this.cache.clear()
    }
}

export default BACENFinancingService
