/**
 * 🔌 ANEEL Tariff Module - Core Interfaces
 * Tipagens baseadas no schema SQL (006_aneel_tariff_module.sql)
 */

import {
    GrupoTarifa,
    ModalidadeTarifa,
    ClasseConsumidor,
    BandeiraTarifaria,
    TipoMMGD,
    ModalidadeMMGD,
    UF,
} from "./enums";

/**
 * Concessionária (Distribuidora de Energia)
 */
export interface Concessionaria {
    id: string;
    nome: string;
    nome_display?: string;
    sigla: string;
    uf: UF[];
    regioes_atendidas?: string[];
    website?: string;
    telefone?: string;
    email?: string;
    voltage_mono?: string;
    voltage_bi?: string;
    voltage_tri?: string;
    codigo_aneel?: string;
    cnpj?: string;
    grupo?: string;
    is_active: boolean;
    is_verified: boolean;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

/**
 * Tarifa de energia
 */
export interface Tarifa {
    id: string;
    concessionaria_id: string;
    uf: UF;
    grupo: GrupoTarifa;
    subgrupo?: string;
    modalidade: ModalidadeTarifa;
    classe: ClasseConsumidor;
    subclasse?: string;

    // Valores (R$/kWh)
    tarifa_kwh: number;
    tarifa_tusd: number; // Tarifa de Uso do Sistema de Distribuição
    tarifa_te: number;   // Tarifa de Energia

    // Bandeiras (R$/kWh adicional)
    bandeira_verde: number;
    bandeira_amarela: number;
    bandeira_vermelha_1: number;
    bandeira_vermelha_2: number;

    // Tarifa Horária Branca
    tarifa_ponta?: number;
    tarifa_intermediario?: number;
    tarifa_fora_ponta?: number;
    horario_ponta_inicio?: string;
    horario_ponta_fim?: string;
    horario_intermediario_inicio?: string;
    horario_intermediario_fim?: string;

    // Limites MMGD
    limite_micro_kwp: number;
    limite_mini_kwp: number;
    limite_oversizing_pct: number;

    // Vigência
    vigencia_inicio: Date;
    vigencia_fim?: Date;
    resolucao_aneel?: string;

    // Status
    is_active: boolean;
    is_current: boolean;

    // Fonte
    fonte: string;
    url_fonte?: string;

    metadata?: Record<string, any>;
    observacoes?: string;
    created_at: Date;
    updated_at: Date;
}

/**
 * Bandeira tarifária histórico
 */
export interface BandeiraHistorico {
    id: string;
    mes: number; // 1-12
    ano: number;
    bandeira: BandeiraTarifaria;
    valor_adicional: number;
    valor_100kwh?: number;
    motivo?: string;
    regiao: string;
    subsistema?: string;
    fonte: string;
    url_fonte?: string;
    resolucao?: string;
    created_at: Date;
}

/**
 * Classe MMGD (Lei 14.300/2022)
 */
export interface MMGDClasse {
    id: string;
    codigo: string;
    nome: string;
    descricao?: string;
    tipo_mmgd: TipoMMGD;
    modalidade: ModalidadeMMGD;
    potencia_min_kwp: number;
    potencia_max_kwp?: number;
    credito_validade_meses: number;
    transferencia_permitida: boolean;
    autoconsumo_remoto: boolean;
    oversizing_min_pct: number;
    oversizing_max_pct: number;
    oversizing_recomendado_pct: number;
    isencao_tusd: boolean;
    desconto_tusd_pct?: number;
    fio_b_aplicavel: boolean;
    documentos_required?: Record<string, any>;
    is_active: boolean;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

/**
 * Cache de tarifa
 */
export interface TariffCache {
    id: string;
    cache_key: string;
    concessionaria_id?: string;
    tarifa_id?: string;
    data: Record<string, any>;
    hits: number;
    last_hit_at?: Date;
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
}

/**
 * DTO: Consulta de tarifa vigente
 */
export interface TarifaVigenteQuery {
    uf: UF;
    grupo?: GrupoTarifa;
    classe?: ClasseConsumidor;
    modalidade?: ModalidadeTarifa;
    concessionaria_sigla?: string;
    data_referencia?: Date;
}

/**
 * DTO: Resultado de consulta de tarifa
 */
export interface TarifaVigenteResult {
    tarifa: Tarifa;
    concessionaria: Concessionaria;
    bandeira_atual: BandeiraHistorico;
    /** Tarifa total considerando bandeira atual (R$/kWh) */
    tarifa_efetiva_kwh: number;
    /** Bandeira vigente no mês */
    bandeira_vigente: BandeiraTarifaria;
    /** Validade da consulta */
    cached_at?: Date;
    cache_ttl_seconds?: number;
}

/**
 * DTO: Cálculo de custo anual
 */
export interface CustoAnualInput {
    uf: UF;
    consumo_mensal_kwh: number;
    grupo?: GrupoTarifa;
    classe?: ClasseConsumidor;
    bandeira_media?: BandeiraTarifaria;
    concessionaria_sigla?: string;
}

export interface CustoAnualResult {
    custo_anual: number;
    custo_mensal_medio: number;
    tarifa_utilizada: TarifaVigenteResult;
    breakdown: {
        energia: number;
        distribuicao: number;
        bandeira: number;
    };
}

/**
 * DTO: Cálculo de economia solar
 */
export interface EconomiaSolarInput {
    uf: UF;
    consumo_mensal_kwh: number;
    geracao_mensal_kwh: number;
    grupo?: GrupoTarifa;
    classe?: ClasseConsumidor;
    concessionaria_sigla?: string;
    custo_sistema?: number;
}

export interface EconomiaSolarResult {
    custo_anual_atual: number;
    custo_anual_novo: number;
    economia_anual: number;
    economia_percentual: number;
    payback_anos?: number;
    roi_percentual?: number;
    tarifa_utilizada: TarifaVigenteResult;
}

/**
 * DTO: Batch query (prevenção N+1)
 */
export interface TarifasBatchQuery {
    ufs: UF[];
    grupo?: GrupoTarifa;
    classe?: ClasseConsumidor;
}

export interface TarifasBatchResult {
    tarifas: Map<UF, TarifaVigenteResult>;
    errors: Map<UF, string>;
    cached_count: number;
    db_query_count: number;
}
