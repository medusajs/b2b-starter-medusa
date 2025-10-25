/**
 * Solar Calculator Module - Core Functions
 * 
 * Funções puras para cálculos de sistemas fotovoltaicos.
 * Sem dependências externas - pode ser usado em backend, admin e storefront.
 */

import {
    SolarSystem,
    SolarPanel,
    SolarInverter,
    PanelToInverterRatioResult,
    EnergyGenerationEstimate,
    SystemCompatibilityResult,
    CompatibilityIssue,
    CompatibilityWarning,
    RatioCalculationOptions,
    GenerationEstimateOptions,
    CalculationConfig,
} from './types';

import {
    PANEL_TO_INVERTER_RATIO,
    STRICT_RATIO_RANGES,
    RATIO_STATUS_MESSAGES,
    DEFAULT_PEAK_SUN_HOURS,
    PEAK_SUN_HOURS_BY_STATE,
    DEFAULT_CALCULATION_CONFIG,
    COMPATIBILITY_CODES,
    VALIDATION_LIMITS,
    UNIT_CONVERSION,
} from './constants';

/**
 * Calcula a potência total dos painéis em kW
 */
export function calculateTotalPanelPower(panels: SolarPanel[]): number {
    return panels.reduce((total, panel) => {
        return total + (panel.power_w * panel.quantity * UNIT_CONVERSION.W_TO_KW);
    }, 0);
}

/**
 * Calcula a potência total dos inversores em kW
 */
export function calculateTotalInverterPower(inverters: SolarInverter[]): number {
    return inverters.reduce((total, inverter) => {
        return total + (inverter.power_kw * inverter.quantity);
    }, 0);
}

/**
 * Calcula o ratio painel/inversor e retorna análise completa
 * 
 * @param panels - Array de painéis solares
 * @param inverters - Array de inversores
 * @param options - Opções de cálculo
 * @returns Resultado da análise de ratio
 */
export function calculatePanelToInverterRatio(
    panels: SolarPanel[],
    inverters: SolarInverter[],
    options: RatioCalculationOptions = {}
): PanelToInverterRatioResult {
    const { considerMaxInputPower = false, strictMode = false } = options;

    const totalPanelPowerKw = calculateTotalPanelPower(panels);
    const totalInverterPowerKw = calculateTotalInverterPower(inverters);

    // Validações básicas
    if (totalPanelPowerKw === 0 || totalInverterPowerKw === 0) {
        return {
            ratio: 0,
            totalPanelPowerKw,
            totalInverterPowerKw,
            status: 'error',
            message: 'Sistema inválido: painéis ou inversores com potência zero',
            details: {
                panelsPerInverter: 0,
                oversizingPercentage: 0,
            },
        };
    }

    const ratio = totalPanelPowerKw / totalInverterPowerKw;
    const oversizingPercentage = (ratio - 1) * 100;

    const totalPanels = panels.reduce((sum, p) => sum + p.quantity, 0);
    const totalInverters = inverters.reduce((sum, i) => sum + i.quantity, 0);
    const panelsPerInverter = totalPanels / totalInverters;

    // Verificar se há potência máxima de entrada definida
    if (considerMaxInputPower) {
        const hasMaxInputPower = inverters.some(inv => inv.max_input_power_kw && inv.max_input_power_kw > 0);
        if (hasMaxInputPower) {
            const totalMaxInput = inverters.reduce((sum, inv) => {
                return sum + ((inv.max_input_power_kw || inv.power_kw) * inv.quantity);
            }, 0);

            if (totalPanelPowerKw > totalMaxInput) {
                return {
                    ratio,
                    totalPanelPowerKw,
                    totalInverterPowerKw,
                    status: 'error',
                    message: `Potência dos painéis (${totalPanelPowerKw.toFixed(2)}kW) excede a potência máxima de entrada dos inversores (${totalMaxInput.toFixed(2)}kW)`,
                    recommendation: 'Adicione mais inversores ou reduza a quantidade de painéis',
                    details: { panelsPerInverter, oversizingPercentage },
                };
            }
        }
    }

    // Selecionar ranges baseado no modo
    const ranges = strictMode ? STRICT_RATIO_RANGES : PANEL_TO_INVERTER_RATIO;

    // Determinar status baseado no ratio
    let status: PanelToInverterRatioResult['status'];
    let message: string;
    let recommendation: string | undefined;

    if (ratio >= ranges.EXCELLENT_MIN && ratio <= ranges.EXCELLENT_MAX) {
        status = 'excellent';
        message = RATIO_STATUS_MESSAGES.excellent;
    } else if (ratio >= ranges.GOOD_MIN && ratio <= ranges.GOOD_MAX) {
        status = 'good';
        message = RATIO_STATUS_MESSAGES.good;
    } else if (ratio >= ranges.ACCEPTABLE_MIN && ratio <= ranges.ACCEPTABLE_MAX) {
        status = 'acceptable';
        message = RATIO_STATUS_MESSAGES.acceptable;

        if (ratio < ranges.GOOD_MIN) {
            recommendation = `Considere adicionar mais ${Math.ceil((ranges.GOOD_MIN * totalInverterPowerKw - totalPanelPowerKw) / (panels[0]?.power_w * UNIT_CONVERSION.W_TO_KW || 0.5))} painéis para otimizar o oversizing`;
        } else if (ratio > ranges.GOOD_MAX) {
            recommendation = 'Sistema com oversizing elevado - verifique se os inversores suportam a potência de entrada';
        }
    } else if (ratio >= ranges.WARNING_MIN && ratio <= ranges.WARNING_MAX) {
        status = 'warning';
        message = RATIO_STATUS_MESSAGES.warning;

        if (ratio < ranges.ACCEPTABLE_MIN) {
            recommendation = `Sistema subdimensionado - adicione pelo menos ${Math.ceil((ranges.ACCEPTABLE_MIN * totalInverterPowerKw - totalPanelPowerKw) / (panels[0]?.power_w * UNIT_CONVERSION.W_TO_KW || 0.5))} painéis`;
        } else {
            recommendation = 'Oversizing muito alto - considere adicionar mais inversores';
        }
    } else {
        status = 'error';
        message = RATIO_STATUS_MESSAGES.error;

        if (ratio < ranges.WARNING_MIN) {
            recommendation = 'Sistema severamente subdimensionado - revise o projeto';
        } else {
            recommendation = 'Oversizing extremo - adicione inversores ou remova painéis';
        }
    }

    return {
        ratio,
        totalPanelPowerKw,
        totalInverterPowerKw,
        status,
        message,
        recommendation,
        details: {
            panelsPerInverter: Math.round(panelsPerInverter * 10) / 10,
            oversizingPercentage: Math.round(oversizingPercentage * 10) / 10,
        },
    };
}

/**
 * Estima a geração de energia do sistema
 * 
 * @param system - Sistema solar completo
 * @param options - Opções de estimativa
 * @returns Estimativa de geração de energia
 */
export function estimateEnergyGeneration(
    system: SolarSystem,
    options: GenerationEstimateOptions = {}
): EnergyGenerationEstimate {
    const { config = DEFAULT_CALCULATION_CONFIG, includeSeasonalVariation = false } = options;

    const totalPanelPowerKw = calculateTotalPanelPower(system.panels);
    const systemSizeKwp = totalPanelPowerKw; // kWp = potência pico

    // Determinar horas de sol pico baseado na localização
    let peakSunHours = DEFAULT_PEAK_SUN_HOURS;

    if (system.location?.state && PEAK_SUN_HOURS_BY_STATE[system.location.state]) {
        peakSunHours = PEAK_SUN_HOURS_BY_STATE[system.location.state];
    }

    // Fórmula: E = P × HSP × PR × η_inv × (1 - perdas)
    // E = Energia gerada (kWh/dia)
    // P = Potência instalada (kWp)
    // HSP = Horas de Sol Pico (h/dia)
    // PR = Performance Ratio (fator de perdas)
    // η_inv = Eficiência do inversor

    const performanceRatio = config.performanceRatio || DEFAULT_CALCULATION_CONFIG.performanceRatio;
    const inverterEff = config.inverterEfficiency || DEFAULT_CALCULATION_CONFIG.inverterEfficiency;
    const cableLosses = 1 - (config.cableAndOtherLosses || DEFAULT_CALCULATION_CONFIG.cableAndOtherLosses);

    const systemEfficiency = performanceRatio * inverterEff * cableLosses;

    const dailyKwh = systemSizeKwp * peakSunHours * systemEfficiency;
    const monthlyKwh = dailyKwh * 30.44; // Média de dias por mês
    const yearlyKwh = dailyKwh * 365;

    return {
        dailyKwh: Math.round(dailyKwh * 100) / 100,
        monthlyKwh: Math.round(monthlyKwh * 100) / 100,
        yearlyKwh: Math.round(yearlyKwh * 100) / 100,
        systemSizeKwp: Math.round(systemSizeKwp * 100) / 100,
        peakSunHours: Math.round(peakSunHours * 10) / 10,
        systemEfficiency: Math.round(systemEfficiency * 1000) / 1000,
        assumptions: {
            peakSunHoursPerDay: peakSunHours,
            performanceRatio,
            degradationFirstYear: config.degradationRate || DEFAULT_CALCULATION_CONFIG.degradationRate,
        },
    };
}

/**
 * Valida a compatibilidade do sistema e identifica problemas
 * 
 * @param system - Sistema solar completo
 * @returns Resultado da validação de compatibilidade
 */
export function validateSystemCompatibility(
    system: SolarSystem
): SystemCompatibilityResult {
    const issues: CompatibilityIssue[] = [];
    const warnings: CompatibilityWarning[] = [];

    // Validação 1: Verificar se há painéis e inversores
    if (system.panels.length === 0) {
        issues.push({
            severity: 'critical',
            code: COMPATIBILITY_CODES.NO_PANELS,
            message: 'Sistema não possui painéis solares',
            affectedComponents: [],
            suggestedFix: 'Adicione pelo menos um painel solar ao sistema',
        });
    }

    if (system.inverters.length === 0) {
        issues.push({
            severity: 'critical',
            code: COMPATIBILITY_CODES.NO_INVERTERS,
            message: 'Sistema não possui inversores',
            affectedComponents: [],
            suggestedFix: 'Adicione pelo menos um inversor ao sistema',
        });
    }

    // Se faltam componentes críticos, retornar imediatamente
    if (issues.length > 0) {
        return {
            isCompatible: false,
            issues,
            warnings,
            score: 0,
        };
    }

    // Validação 2: Verificar limites de potência
    const totalPanelPowerKw = calculateTotalPanelPower(system.panels);
    const totalInverterPowerKw = calculateTotalInverterPower(system.inverters);

    if (totalPanelPowerKw < VALIDATION_LIMITS.MIN_SYSTEM_SIZE_KWP) {
        warnings.push({
            severity: 'medium',
            code: COMPATIBILITY_CODES.EFFICIENCY_CONCERN,
            message: `Sistema muito pequeno (${totalPanelPowerKw.toFixed(2)}kWp) - pode não ser economicamente viável`,
            affectedComponents: system.panels.map(p => p.id),
            impact: 'Custo de instalação por kWp pode ser elevado',
        });
    }

    // Validação 3: Ratio painel/inversor
    const ratioResult = calculatePanelToInverterRatio(system.panels, system.inverters);

    if (ratioResult.status === 'error') {
        issues.push({
            severity: 'high',
            code: COMPATIBILITY_CODES.INVALID_CONFIGURATION,
            message: ratioResult.message,
            affectedComponents: [...system.panels.map(p => p.id), ...system.inverters.map(i => i.id)],
            suggestedFix: ratioResult.recommendation,
        });
    } else if (ratioResult.status === 'warning') {
        warnings.push({
            severity: 'medium',
            code: COMPATIBILITY_CODES.SUBOPTIMAL_RATIO,
            message: ratioResult.message,
            affectedComponents: [...system.panels.map(p => p.id), ...system.inverters.map(i => i.id)],
            impact: ratioResult.recommendation,
        });
    }

    // Validação 4: Tecnologias mistas
    const panelTechnologies = new Set(system.panels.map(p => p.technology).filter(Boolean));
    if (panelTechnologies.size > 1) {
        warnings.push({
            severity: 'low',
            code: COMPATIBILITY_CODES.MIXED_TECHNOLOGIES,
            message: `Sistema utiliza ${panelTechnologies.size} tecnologias diferentes de painéis`,
            affectedComponents: system.panels.map(p => p.id),
            impact: 'Pode resultar em desbalanceamento de corrente',
        });
    }

    // Calcular score (0-100)
    let score = 100;

    score -= issues.filter(i => i.severity === 'critical').length * 50;
    score -= issues.filter(i => i.severity === 'high').length * 25;
    score -= warnings.filter(w => w.severity === 'medium').length * 10;
    score -= warnings.filter(w => w.severity === 'low').length * 5;

    score = Math.max(0, Math.min(100, score));

    return {
        isCompatible: issues.length === 0,
        issues,
        warnings,
        score,
    };
}

/**
 * Calcula a degradação acumulada ao longo dos anos
 * 
 * @param years - Número de anos
 * @param degradationRate - Taxa de degradação anual (ex: 0.005 = 0.5%)
 * @returns Fator de degradação (0-1)
 */
export function calculateDegradation(years: number, degradationRate: number = DEFAULT_CALCULATION_CONFIG.degradationRate): number {
    return Math.pow(1 - degradationRate, years);
}

/**
 * Projeta a geração de energia ao longo dos anos considerando degradação
 * 
 * @param initialYearlyKwh - Geração anual no primeiro ano
 * @param years - Número de anos de projeção
 * @param degradationRate - Taxa de degradação anual
 * @returns Array com geração anual por ano
 */
export function projectEnergyGeneration(
    initialYearlyKwh: number,
    years: number = 25,
    degradationRate: number = DEFAULT_CALCULATION_CONFIG.degradationRate
): { year: number; kWh: number; degradationFactor: number }[] {
    const projection = [];

    for (let year = 1; year <= years; year++) {
        const degradationFactor = calculateDegradation(year - 1, degradationRate);
        const kWh = initialYearlyKwh * degradationFactor;

        projection.push({
            year,
            kWh: Math.round(kWh * 100) / 100,
            degradationFactor: Math.round(degradationFactor * 10000) / 10000,
        });
    }

    return projection;
}
