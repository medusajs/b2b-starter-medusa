import fs from "fs"
import path from "path"

/**
 * PVLib Integration Service
 * Serviço para integração com schemas normalizados do pvlib
 * Fornece parâmetros Sandia (inversores) e CEC (painéis) para simulações solares
 */

export interface SandiaParams {
    Paco: number          // AC power rating (W)
    Pdco: number          // DC power rating (W)
    Vdco: number          // DC voltage rating (V)
    Pso: number           // Self-consumption (W)
    C0: number            // Power loss coefficient
    C1: number            // Power loss coefficient
    C2: number            // Power loss coefficient
    C3: number            // Power loss coefficient
    Pnt: number           // Night tare loss (W)
    Mppt_low: number      // MPPT lower voltage (V)
    Mppt_high: number     // MPPT upper voltage (V)
    Vac: number | null    // AC voltage (V)
    Mppt_channels: number
    Efficiency_Euro: number
    Type: string
    _metadata: {
        normalized_at: string
        source: string
        complete: boolean
        estimated_params: string[]
    }
}

export interface CECParams {
    V_mp_ref: number      // Voltage at max power (V)
    I_mp_ref: number      // Current at max power (A)
    V_oc_ref: number      // Open circuit voltage (V)
    I_sc_ref: number      // Short circuit current (A)
    alpha_sc: number      // Temp coeff Isc (A/°C)
    beta_voc: number      // Temp coeff Voc (V/°C)
    gamma_pmax: number    // Temp coeff Pmax (%/°C)
    a_ref: number         // Modified ideality factor
    I_L_ref: number       // Light current (A)
    I_o_ref: number       // Diode saturation current (A)
    R_sh_ref: number      // Shunt resistance (Ω)
    R_s: number           // Series resistance (Ω)
    Adjust: number        // CEC adjustment factor
    Technology: string
    N_s: number           // Cells in series
    NOCT: number          // Nominal Operating Cell Temp (°C)
    A_c: number           // Module area (m²)
    STC: number           // Rated power at STC (W)
    Efficiency: number    // Module efficiency (%)
    Bifacial: boolean
    Bifaciality: number
    pvhawk: {
        thermal_imaging_compatible: boolean
        rated_temperature: number
        thermal_coefficients: {
            alpha_sc: number
            beta_voc: number
            gamma_pmax: number
        }
        hotspot_threshold: number
        anomaly_detection_enabled: boolean
        thermal_model: string
    }
    _metadata: {
        normalized_at: string
        source: string
        complete: boolean
        estimated_params: string[]
    }
}

export interface InverterPVLib {
    id: string
    name: string
    manufacturer: string
    category: string
    price_brl?: number
    technical_specs: {
        power_w: number
        type: string
        voltage_v?: number
        phases?: string
    }
    pvlib_params?: {
        pdc0: number
        ps0: number
        vdc_nom: number
        vac_nom?: number
        mppt_low: number
        mppt_high: number
        european_efficiency: number
        mppt_channels: number
    }
    sandia_params?: SandiaParams
    metadata: {
        normalized?: boolean
        data_cleaned?: boolean
        [key: string]: any
    }
}

export interface PanelPVLib {
    id: string
    name: string
    manufacturer: string
    category: string
    price_brl?: number
    technical_specs: {
        power_w: number
        technology?: string
    }
    pvlib_params?: {
        pmax: number
        technology: string
        vmp: number
        imp: number
        voc: number
        isc: number
        cells_in_series: number
        module_efficiency: number
        area: number
        temp_coeff_pmax: number
        temp_coeff_voc: number
        temp_coeff_isc: number
        noct: number
    }
    cec_params?: CECParams
    metadata: {
        normalized?: boolean
        data_cleaned?: boolean
        [key: string]: any
    }
}

export interface MPPTValidationResult {
    compatible: boolean
    v_string_min: number
    v_string_max: number
    v_mppt_low: number
    v_mppt_high: number
    temperature_range: {
        min_temp: number
        max_temp: number
    }
    warnings: string[]
    recommendations?: string[]
}

export interface PVLibServiceOptions {
    requestTimeout?: number;
    cacheTTL?: number;
}

class PVLibIntegrationService {
    private invertersPath: string
    private panelsPath: string
    private invertersCache: InverterPVLib[] | null = null
    private panelsCache: PanelPVLib[] | null = null
    private cacheTimestamp: number = 0
    private readonly CACHE_TTL: number
    private readonly requestTimeout: number

    constructor(options?: PVLibServiceOptions) {
        this.CACHE_TTL = options?.cacheTTL ?? 1000 * 60 * 60; // 1 hour default
        this.requestTimeout = options?.requestTimeout ?? 30000; // 30s default
        // Paths para os schemas normalizados e limpos
        const baseERP = path.resolve(__dirname, "../../../../../ysh-erp/data/catalog/normalized_pvlib")

        this.invertersPath = path.join(baseERP, "normalized_inverters_sandia_clean.json")
        this.panelsPath = path.join(baseERP, "normalized_panels_cec_clean.json")

        // Fallback para schemas não-limpos
        if (!fs.existsSync(this.invertersPath)) {
            this.invertersPath = path.join(baseERP, "normalized_inverters_sandia.json")
        }
        if (!fs.existsSync(this.panelsPath)) {
            this.panelsPath = path.join(baseERP, "normalized_panels_cec.json")
        }
    }

    /**
     * Carrega inversores normalizados com cache
     */
    loadInverters(): InverterPVLib[] {
        const now = Date.now()

        if (this.invertersCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
            return this.invertersCache
        }

        try {
            const data = fs.readFileSync(this.invertersPath, "utf-8")
            this.invertersCache = JSON.parse(data)
            this.cacheTimestamp = now
            return this.invertersCache || []
        } catch (error) {
            console.error("Erro ao carregar inversores PVLib:", error)
            return []
        }
    }

    /**
     * Carrega painéis normalizados com cache
     */
    loadPanels(): PanelPVLib[] {
        const now = Date.now()

        if (this.panelsCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
            return this.panelsCache
        }

        try {
            const data = fs.readFileSync(this.panelsPath, "utf-8")
            this.panelsCache = JSON.parse(data)
            this.cacheTimestamp = now
            return this.panelsCache || []
        } catch (error) {
            console.error("Erro ao carregar painéis PVLib:", error)
            return []
        }
    }

    /**
     * Busca inversor por ID com parâmetros Sandia completos
     */
    getInverterById(id: string): InverterPVLib | null {
        const inverters = this.loadInverters()
        return inverters.find(inv => inv.id === id) || null
    }

    /**
     * Busca painel por ID com parâmetros CEC completos
     */
    getPanelById(id: string): PanelPVLib | null {
        const panels = this.loadPanels()
        return panels.find(panel => panel.id === id) || null
    }

    /**
     * Lista todos inversores com parâmetros Sandia completos
     */
    listCompleteInverters(): InverterPVLib[] {
        const inverters = this.loadInverters()
        return inverters.filter(inv =>
            inv.sandia_params?._metadata?.complete === true
        )
    }

    /**
     * Lista todos painéis com parâmetros CEC completos
     */
    listCompletePanels(): PanelPVLib[] {
        const panels = this.loadPanels()
        return panels.filter(panel =>
            panel.cec_params?._metadata?.complete === true
        )
    }

    /**
     * Valida compatibilidade MPPT entre inversor e string de painéis
     * Considera variação de temperatura de -10°C a 70°C
     */
    validateMPPT(
        inverter: InverterPVLib,
        panel: PanelPVLib,
        modulesPerString: number
    ): MPPTValidationResult {
        const result: MPPTValidationResult = {
            compatible: false,
            v_string_min: 0,
            v_string_max: 0,
            v_mppt_low: 0,
            v_mppt_high: 0,
            temperature_range: {
                min_temp: -10,
                max_temp: 70
            },
            warnings: [],
            recommendations: []
        }

        // Valida se tem parâmetros necessários
        if (!inverter.sandia_params) {
            result.warnings.push("Inversor sem parâmetros Sandia")
            return result
        }

        if (!panel.cec_params) {
            result.warnings.push("Painel sem parâmetros CEC")
            return result
        }

        const { Mppt_low, Mppt_high } = inverter.sandia_params
        const { V_mp_ref, V_oc_ref, beta_voc } = panel.cec_params

        result.v_mppt_low = Mppt_low
        result.v_mppt_high = Mppt_high

        // Calcula tensão mínima (Vmp a 70°C)
        const tempDiff_hot = 70 - 25 // STC é 25°C
        const vmp_hot = V_mp_ref + (beta_voc * tempDiff_hot)
        result.v_string_min = vmp_hot * modulesPerString

        // Calcula tensão máxima (Voc a -10°C)
        const tempDiff_cold = -10 - 25
        const voc_cold = V_oc_ref + (beta_voc * tempDiff_cold)
        result.v_string_max = voc_cold * modulesPerString

        // Valida ranges
        const minOk = result.v_string_min >= Mppt_low
        const maxOk = result.v_string_max <= Mppt_high

        result.compatible = minOk && maxOk

        // Warnings
        if (!minOk) {
            result.warnings.push(
                `Tensão mínima da string (${result.v_string_min.toFixed(1)}V) está abaixo do MPPT mínimo (${Mppt_low}V)`
            )
            result.recommendations?.push(
                `Reduzir número de módulos para ${Math.floor(Mppt_low / vmp_hot)} ou menos`
            )
        }

        if (!maxOk) {
            result.warnings.push(
                `Tensão máxima da string (${result.v_string_max.toFixed(1)}V) está acima do MPPT máximo (${Mppt_high}V)`
            )
            result.recommendations?.push(
                `Reduzir número de módulos para ${Math.floor(Mppt_high / voc_cold)} ou menos`
            )
        }

        // Margem de segurança recomendada (10%)
        const margin = 0.1
        const marginLow = Mppt_low * (1 + margin)
        const marginHigh = Mppt_high * (1 - margin)

        if (result.v_string_min < marginLow && minOk) {
            result.warnings.push(
                `Tensão mínima próxima ao limite inferior (margem de segurança < 10%)`
            )
        }

        if (result.v_string_max > marginHigh && maxOk) {
            result.warnings.push(
                `Tensão máxima próxima ao limite superior (margem de segurança < 10%)`
            )
        }

        return result
    }

    /**
     * Busca inversores por potência (com tolerância de ±20%)
     */
    findInvertersByPower(powerW: number, tolerance: number = 0.2): InverterPVLib[] {
        const inverters = this.loadInverters()
        const minPower = powerW * (1 - tolerance)
        const maxPower = powerW * (1 + tolerance)

        return inverters.filter(inv => {
            const power = inv.technical_specs?.power_w || inv.pvlib_params?.pdc0 || 0
            return power >= minPower && power <= maxPower
        }).sort((a, b) => {
            const powerA = a.technical_specs?.power_w || 0
            const powerB = b.technical_specs?.power_w || 0
            return Math.abs(powerA - powerW) - Math.abs(powerB - powerW)
        })
    }

    /**
     * Busca painéis por potência (com tolerância de ±15%)
     */
    findPanelsByPower(powerW: number, tolerance: number = 0.15): PanelPVLib[] {
        const panels = this.loadPanels()
        const minPower = powerW * (1 - tolerance)
        const maxPower = powerW * (1 + tolerance)

        return panels.filter(panel => {
            const power = panel.technical_specs?.power_w || panel.pvlib_params?.pmax || 0
            return power >= minPower && power <= maxPower
        }).sort((a, b) => {
            const powerA = a.technical_specs?.power_w || 0
            const powerB = b.technical_specs?.power_w || 0
            return Math.abs(powerA - powerW) - Math.abs(powerB - powerW)
        })
    }

    /**
     * Estatísticas dos schemas normalizados
     */
    getStats() {
        const inverters = this.loadInverters()
        const panels = this.loadPanels()

        const invertersComplete = inverters.filter(inv =>
            inv.sandia_params?._metadata?.complete === true
        )
        const panelsComplete = panels.filter(panel =>
            panel.cec_params?._metadata?.complete === true
        )

        return {
            inverters: {
                total: inverters.length,
                complete: invertersComplete.length,
                completeness_pct: (invertersComplete.length / inverters.length) * 100
            },
            panels: {
                total: panels.length,
                complete: panelsComplete.length,
                completeness_pct: (panelsComplete.length / panels.length) * 100
            },
            cache: {
                active: this.invertersCache !== null,
                timestamp: new Date(this.cacheTimestamp).toISOString()
            }
        }
    }

    /**
     * Limpa cache forçando reload
     */
    clearCache() {
        this.invertersCache = null
        this.panelsCache = null
        this.cacheTimestamp = 0
    }
}

export default PVLibIntegrationService
