/**
 * Solar Calculator Module - Type Definitions
 * 
 * Tipos compartilhados para cálculos de sistemas fotovoltaicos.
 * Usado por backend (API), admin widgets e validações.
 */

/**
 * Componente de painel solar
 */
export interface SolarPanel {
  id: string;
  name: string;
  manufacturer?: string;
  power_w: number;        // Potência nominal em Watts
  quantity: number;       // Quantidade de painéis
  efficiency?: number;    // Eficiência (0-1, ex: 0.21 = 21%)
  technology?: string;    // Ex: "Monocristalino", "Policristalino"
}

/**
 * Componente de inversor
 */
export interface SolarInverter {
  id: string;
  name: string;
  manufacturer?: string;
  power_kw: number;       // Potência nominal em kW
  quantity: number;       // Quantidade de inversores
  efficiency?: number;    // Eficiência (0-1, ex: 0.975 = 97.5%)
  type?: string;          // Ex: "STRING", "MICROINVERSOR", "CENTRAL"
  max_input_power_kw?: number; // Potência máxima de entrada
}

/**
 * Sistema solar completo
 */
export interface SolarSystem {
  panels: SolarPanel[];
  inverters: SolarInverter[];
  location?: {
    state?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
}

/**
 * Resultado da análise de ratio painel/inversor
 */
export interface PanelToInverterRatioResult {
  ratio: number;                    // Ratio calculado (ex: 1.25)
  totalPanelPowerKw: number;        // Potência total dos painéis em kW
  totalInverterPowerKw: number;     // Potência total dos inversores em kW
  status: 'excellent' | 'good' | 'acceptable' | 'warning' | 'error';
  message: string;                  // Mensagem explicativa
  recommendation?: string;          // Recomendação de ajuste (opcional)
  details: {
    panelsPerInverter: number;      // Média de painéis por inversor
    oversizingPercentage: number;   // % de oversizing (ex: 25 = 125%)
  };
}

/**
 * Estimativa de geração de energia
 */
export interface EnergyGenerationEstimate {
  dailyKwh: number;                 // Geração diária estimada (kWh)
  monthlyKwh: number;               // Geração mensal estimada (kWh)
  yearlyKwh: number;                // Geração anual estimada (kWh)
  systemSizeKwp: number;            // Tamanho do sistema (kWp)
  peakSunHours: number;             // Horas de sol pico consideradas
  systemEfficiency: number;         // Eficiência do sistema (0-1)
  assumptions: {
    peakSunHoursPerDay: number;     // HSP/dia usado no cálculo
    performanceRatio: number;       // Performance Ratio (PR) considerado
    degradationFirstYear: number;   // Degradação no 1º ano (%)
  };
}

/**
 * Resultado da validação de compatibilidade
 */
export interface SystemCompatibilityResult {
  isCompatible: boolean;
  issues: CompatibilityIssue[];
  warnings: CompatibilityWarning[];
  score: number;                    // Score de 0-100
}

/**
 * Problema de compatibilidade (bloqueante)
 */
export interface CompatibilityIssue {
  severity: 'critical' | 'high';
  code: string;                     // Ex: "VOLTAGE_MISMATCH"
  message: string;
  affectedComponents: string[];
  suggestedFix?: string;
}

/**
 * Aviso de compatibilidade (não bloqueante)
 */
export interface CompatibilityWarning {
  severity: 'medium' | 'low';
  code: string;                     // Ex: "SUBOPTIMAL_RATIO"
  message: string;
  affectedComponents: string[];
  impact?: string;                  // Impacto estimado
}

/**
 * Parâmetros regionais para cálculos
 */
export interface RegionalParameters {
  state: string;
  peakSunHours: number;             // HSP médio diário
  seasonalVariation?: {
    summer: number;                 // HSP no verão
    winter: number;                 // HSP no inverno
  };
  averageTemperature?: number;      // Temperatura média anual (°C)
  altitudeMeters?: number;          // Altitude (m)
}

/**
 * Configurações de cálculo
 */
export interface CalculationConfig {
  performanceRatio?: number;        // Default: 0.80 (80%)
  degradationRate?: number;         // Default: 0.005 (0.5% ao ano)
  inverterEfficiency?: number;      // Default: 0.975 (97.5%)
  cableAndOtherLosses?: number;     // Default: 0.03 (3%)
  regionalParams?: RegionalParameters;
}

/**
 * Opções para cálculo de ratio
 */
export interface RatioCalculationOptions {
  considerMaxInputPower?: boolean;  // Considerar potência máxima de entrada
  strictMode?: boolean;             // Modo estrito (ranges mais apertados)
}

/**
 * Opções para estimativa de geração
 */
export interface GenerationEstimateOptions {
  config?: CalculationConfig;
  includeSeasonalVariation?: boolean;
  projectionYears?: number;         // Anos de projeção (default: 25)
}
