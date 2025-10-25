/**
 * 📋 ANEEL Tariff Module - Type Definitions
 * Enums e constantes baseados no schema SQL (006_aneel_tariff_module.sql)
 */

/**
 * Grupos tarifários ANEEL
 * - B1-B4: Baixa tensão (< 2,3 kV)
 * - A1-AS: Alta tensão (≥ 2,3 kV)
 */
export enum GrupoTarifa {
    /** Residencial */
    B1 = "B1",
    /** Rural */
    B2 = "B2",
    /** Demais classes */
    B3 = "B3",
    /** Iluminação pública */
    B4 = "B4",
    /** Alta tensão 230 kV+ */
    A1 = "A1",
    /** Alta tensão 88-138 kV */
    A2 = "A2",
    /** Alta tensão 69 kV */
    A3 = "A3",
    /** Alta tensão 30-44 kV */
    A3a = "A3a",
    /** Alta tensão 2,3-25 kV */
    A4 = "A4",
    /** Subterrâneo */
    AS = "AS",
}

/**
 * Modalidades tarifárias
 */
export enum ModalidadeTarifa {
    /** Tarifa convencional (única) */
    CONVENCIONAL = "convencional",
    /** Tarifa horária branca (ponta, intermediário, fora-ponta) */
    HORARIA_BRANCA = "horaria_branca",
    /** Tarifa horária verde (demanda única) */
    HORARIA_VERDE = "horaria_verde",
    /** Tarifa horária azul (demanda ponta e fora-ponta) */
    HORARIA_AZUL = "horaria_azul",
}

/**
 * Classes de consumidor
 */
export enum ClasseConsumidor {
    RESIDENCIAL = "residencial",
    COMERCIAL = "comercial",
    INDUSTRIAL = "industrial",
    RURAL = "rural",
    PODER_PUBLICO = "poder_publico",
    ILUMINACAO_PUBLICA = "iluminacao_publica",
    SERVICO_PUBLICO = "servico_publico",
}

/**
 * Bandeiras tarifárias
 */
export enum BandeiraTarifaria {
    VERDE = "verde",
    AMARELA = "amarela",
    VERMELHA_1 = "vermelha_1",
    VERMELHA_2 = "vermelha_2",
}

/**
 * Tipos de MMGD (Micro e Minigeração Distribuída)
 * Lei 14.300/2022
 */
export enum TipoMMGD {
    MICROGERACAO = "microgeracao",
    MINIGERACAO = "minigeracao",
}

/**
 * Modalidades MMGD
 */
export enum ModalidadeMMGD {
    CONSUMO_PROPRIO = "consumo_proprio",
    GERACAO_COMPARTILHADA = "geracao_compartilhada",
    COOPERATIVA = "cooperativa",
    CONSORCIO = "consorcio",
    AUTOCONSUMO_REMOTO = "autoconsumo_remoto",
}

/**
 * Unidades da Federação (Brasil)
 */
export enum UF {
    AC = "AC", AL = "AL", AP = "AP", AM = "AM",
    BA = "BA", CE = "CE", DF = "DF", ES = "ES",
    GO = "GO", MA = "MA", MT = "MT", MS = "MS",
    MG = "MG", PA = "PA", PB = "PB", PR = "PR",
    PE = "PE", PI = "PI", RJ = "RJ", RN = "RN",
    RS = "RS", RO = "RO", RR = "RR", SC = "SC",
    SP = "SP", SE = "SE", TO = "TO",
}

/**
 * Constantes MMGD (Lei 14.300/2022)
 */
export const MMGD_CONSTANTS = {
    /** Limite microgeração (kWp) */
    MICRO_LIMIT_KWP: 75.0,
    /** Limite minigeração (kWp) */
    MINI_LIMIT_KWP: 5000.0,
    /** Validade créditos (meses) */
    CREDITO_VALIDADE_MESES: 60,
    /** Oversizing mínimo (%) - Marco Legal */
    OVERSIZING_MIN_PCT: 114.0,
    /** Oversizing máximo (%) - ANEEL */
    OVERSIZING_MAX_PCT: 160.0,
    /** Oversizing recomendado (%) */
    OVERSIZING_RECOMENDADO_PCT: 130.0,
} as const;

/**
 * Valores de bandeira tarifária (R$/kWh)
 * Atualizados conforme ANEEL 2024/2025
 */
export const BANDEIRA_VALORES = {
    [BandeiraTarifaria.VERDE]: 0,
    [BandeiraTarifaria.AMARELA]: 0.02,
    [BandeiraTarifaria.VERMELHA_1]: 0.04,
    [BandeiraTarifaria.VERMELHA_2]: 0.06,
} as const;

/**
 * Mapeamento de estados para regiões
 */
export const UF_TO_REGION: Record<UF, string> = {
    [UF.SP]: "sudeste", [UF.RJ]: "sudeste", [UF.MG]: "sudeste", [UF.ES]: "sudeste",
    [UF.PR]: "sul", [UF.SC]: "sul", [UF.RS]: "sul",
    [UF.BA]: "nordeste", [UF.CE]: "nordeste", [UF.PE]: "nordeste", [UF.AL]: "nordeste",
    [UF.SE]: "nordeste", [UF.RN]: "nordeste", [UF.PB]: "nordeste", [UF.PI]: "nordeste",
    [UF.MA]: "nordeste",
    [UF.GO]: "centro_oeste", [UF.MT]: "centro_oeste", [UF.MS]: "centro_oeste", [UF.DF]: "centro_oeste",
    [UF.AM]: "norte", [UF.PA]: "norte", [UF.AC]: "norte", [UF.RO]: "norte",
    [UF.RR]: "norte", [UF.AP]: "norte", [UF.TO]: "norte",
};
