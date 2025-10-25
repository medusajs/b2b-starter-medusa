/**
 * Solar Calculator Module - Constants
 * 
 * Constantes técnicas para cálculos fotovoltaicos baseados em
 * padrões da ABNT NBR 16690:2019 e boas práticas de mercado.
 */

/**
 * Horas de Sol Pico (HSP) médias por estado brasileiro
 * Fonte: Atlas Solarimétrico do Brasil (CRESESB/CEPEL)
 */
export const PEAK_SUN_HOURS_BY_STATE: Record<string, number> = {
    // Região Norte (alta irradiação)
    'AC': 4.8, // Acre
    'AP': 5.2, // Amapá
    'AM': 4.9, // Amazonas
    'PA': 5.0, // Pará
    'RO': 4.7, // Rondônia
    'RR': 5.3, // Roraima (maior do Brasil)
    'TO': 5.4, // Tocantins

    // Região Nordeste (excelente irradiação)
    'AL': 5.5, // Alagoas
    'BA': 5.8, // Bahia (excelente)
    'CE': 5.7, // Ceará
    'MA': 5.3, // Maranhão
    'PB': 5.6, // Paraíba
    'PE': 5.5, // Pernambuco
    'PI': 5.8, // Piauí (excelente)
    'RN': 5.9, // Rio Grande do Norte (excelente)
    'SE': 5.5, // Sergipe

    // Região Centro-Oeste (boa irradiação)
    'DF': 5.3, // Distrito Federal
    'GO': 5.4, // Goiás
    'MT': 5.2, // Mato Grosso
    'MS': 5.3, // Mato Grosso do Sul

    // Região Sudeste (boa irradiação)
    'ES': 5.0, // Espírito Santo
    'MG': 5.4, // Minas Gerais
    'RJ': 4.9, // Rio de Janeiro
    'SP': 4.6, // São Paulo

    // Região Sul (menor irradiação do Brasil)
    'PR': 4.5, // Paraná
    'RS': 4.4, // Rio Grande do Sul
    'SC': 4.3, // Santa Catarina
};

/**
 * Horas de sol pico padrão (média Brasil)
 */
export const DEFAULT_PEAK_SUN_HOURS = 5.0;

/**
 * Performance Ratio (PR) típico para sistemas residenciais/comerciais
 * Leva em conta perdas por temperatura, sujeira, cabeamento, etc.
 */
export const DEFAULT_PERFORMANCE_RATIO = 0.80; // 80%

/**
 * Eficiência nominal de inversores modernos
 */
export const DEFAULT_INVERTER_EFFICIENCY = 0.975; // 97.5%

/**
 * Taxa de degradação anual dos painéis
 * Painéis Tier 1 típicos: 0.5% ao ano
 */
export const DEFAULT_DEGRADATION_RATE = 0.005; // 0.5% ao ano

/**
 * Perdas em cabos, conexões e outros
 */
export const DEFAULT_CABLE_LOSSES = 0.03; // 3%

/**
 * Ranges aceitáveis para ratio painel/inversor
 */
export const PANEL_TO_INVERTER_RATIO = {
    // Ratio ideal (oversizing otimizado)
    EXCELLENT_MIN: 1.10,
    EXCELLENT_MAX: 1.30,

    // Ratio aceitável (funcional mas pode ser otimizado)
    GOOD_MIN: 1.05,
    GOOD_MAX: 1.35,

    // Ratio funcional (dentro dos limites técnicos)
    ACCEPTABLE_MIN: 0.85,
    ACCEPTABLE_MAX: 1.50,

    // Abaixo/acima destes valores: warning/error
    WARNING_MIN: 0.80,
    WARNING_MAX: 1.60,
} as const;

/**
 * Ranges para modo estrito (projetos comerciais/industriais)
 */
export const STRICT_RATIO_RANGES = {
    EXCELLENT_MIN: 1.15,
    EXCELLENT_MAX: 1.25,
    GOOD_MIN: 1.10,
    GOOD_MAX: 1.30,
    ACCEPTABLE_MIN: 1.00,
    ACCEPTABLE_MAX: 1.40,
    WARNING_MIN: 0.90,
    WARNING_MAX: 1.50,
} as const;

/**
 * Vida útil típica de componentes (anos)
 */
export const COMPONENT_LIFESPAN = {
    PANELS: 25,           // Garantia de performance típica
    INVERTERS: 10,        // String inverters
    MICROINVERTERS: 15,   // Microinversores (garantia estendida)
    BATTERIES: 10,        // Baterias de lítio
    STRUCTURES: 25,       // Estruturas de alumínio/aço
} as const;

/**
 * Códigos de erro/warning de compatibilidade
 */
export const COMPATIBILITY_CODES = {
    // Critical errors
    NO_PANELS: 'NO_PANELS',
    NO_INVERTERS: 'NO_INVERTERS',
    VOLTAGE_MISMATCH: 'VOLTAGE_MISMATCH',
    POWER_OVERLOAD: 'POWER_OVERLOAD',
    INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',

    // High severity
    EXTREME_OVERSIZING: 'EXTREME_OVERSIZING',
    EXTREME_UNDERSIZING: 'EXTREME_UNDERSIZING',
    INVERTER_UNDERUTILIZED: 'INVERTER_UNDERUTILIZED',

    // Medium severity
    SUBOPTIMAL_RATIO: 'SUBOPTIMAL_RATIO',
    EFFICIENCY_CONCERN: 'EFFICIENCY_CONCERN',
    MIXED_TECHNOLOGIES: 'MIXED_TECHNOLOGIES',

    // Low severity
    RECOMMENDATION: 'RECOMMENDATION',
    OPTIMIZATION_OPPORTUNITY: 'OPTIMIZATION_OPPORTUNITY',
} as const;

/**
 * Mensagens de status para ratio
 */
export const RATIO_STATUS_MESSAGES = {
    excellent: '✅ Excelente - Oversizing otimizado para máxima geração',
    good: '👍 Bom - Sistema dimensionado adequadamente',
    acceptable: '⚠️ Aceitável - Sistema funcional mas pode ser otimizado',
    warning: '⚠️ Atenção - Revisar dimensionamento',
    error: '❌ Erro - Dimensionamento fora dos padrões técnicos',
} as const;

/**
 * Temperatura padrão para testes STC (Standard Test Conditions)
 */
export const STC_TEMPERATURE = 25; // °C

/**
 * Coeficiente de temperatura típico para painéis (perda por °C acima de 25°C)
 */
export const TEMPERATURE_COEFFICIENT = -0.004; // -0.4% por °C

/**
 * Fator de conversão de unidades
 */
export const UNIT_CONVERSION = {
    W_TO_KW: 0.001,
    KW_TO_W: 1000,
    KWH_TO_MWH: 0.001,
    MWH_TO_KWH: 1000,
} as const;

/**
 * Limites de validação
 */
export const VALIDATION_LIMITS = {
    MIN_PANEL_POWER_W: 50,          // Painéis < 50W são considerados inválidos
    MAX_PANEL_POWER_W: 700,         // Painéis > 700W são raros (validar)
    MIN_INVERTER_POWER_KW: 0.25,    // Microinversores típicos
    MAX_INVERTER_POWER_KW: 5000,    // Inversores centrais industriais
    MIN_SYSTEM_SIZE_KWP: 0.5,       // Sistemas < 0.5kWp são raros
    MAX_RESIDENTIAL_KWP: 75,        // Limite GD Minigeração (Resolução 482)
    MAX_COMMERCIAL_KWP: 5000,       // Limite GD Microgeração
} as const;

/**
 * Configuração padrão para cálculos
 */
export const DEFAULT_CALCULATION_CONFIG = {
    performanceRatio: DEFAULT_PERFORMANCE_RATIO,
    degradationRate: DEFAULT_DEGRADATION_RATE,
    inverterEfficiency: DEFAULT_INVERTER_EFFICIENCY,
    cableAndOtherLosses: DEFAULT_CABLE_LOSSES,
} as const;
