/**
 * Viability Module Types
 * Baseado no schema pv_design.json do AGENTS.md
 */

export interface ViabilityInput {
    consumo_kwh_mes: number
    fatura_media: number
    cep: string
    tipo_telhado: 'laje' | 'ceramica' | 'metalico' | 'solo'
    orientacao?: 'auto' | { azimute: number; inclinacao: number }
    sombreamento?: 'baixo' | 'medio' | 'alto'
    meta_roi_anos?: number
    imagens_satelite?: string[]
}

export interface ViabilityOutput {
    proposal_kwp: number
    expected_gen_mwh_y: number
    pr: number // Performance Ratio
    losses: {
        soiling: number
        temp: number
        ohmic: number
        shading?: number
    }
    inverters: Array<{
        model: string
        phase: 'mono' | 'bi' | 'tri'
        mppt: number
        quantity: number
    }>
    strings: Array<{
        modules: number
        model: string
        power_wp: number
    }>
    oversizing_ratio: number
    hsp: number // Horas de Sol Pleno
    degradacao_anual: number
    layout_url?: string
    attachments: string[]
}

export interface RoofData {
    area_disponivel_m2: number
    orientacao_predominante: string
    inclinacao_graus: number
    obstrucoes: Array<{
        tipo: string
        area_m2: number
    }>
    paineis_existentes?: Array<{
        quantidade: number
        potencia_wp: number
        ano_instalacao: number
    }>
}

export interface EnergyEstimate {
    geracao_mensal_kwh: number[]
    geracao_anual_kwh: number
    economia_mensal_brl: number[]
    economia_anual_brl: number
    compensacao_percentual: number
    excedente_kwh: number
}
