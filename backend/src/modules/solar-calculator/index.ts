/**
 * Solar Calculator Module - Main Export
 * 
 * Módulo reutilizável para cálculos de sistemas fotovoltaicos.
 * Sem dependências externas - pode ser usado em qualquer ambiente.
 */

// Export types
export * from './types';

// Export constants
export * from './constants';

// Export calculator functions
export * from './calculator';

// Re-export commonly used items for convenience
export {
    calculatePanelToInverterRatio,
    estimateEnergyGeneration,
    validateSystemCompatibility,
    calculateTotalPanelPower,
    calculateTotalInverterPower,
    calculateDegradation,
    projectEnergyGeneration,
} from './calculator';

export {
    PANEL_TO_INVERTER_RATIO,
    PEAK_SUN_HOURS_BY_STATE,
    DEFAULT_PEAK_SUN_HOURS,
    DEFAULT_PERFORMANCE_RATIO,
    RATIO_STATUS_MESSAGES,
} from './constants';

export type {
    SolarSystem,
    SolarPanel,
    SolarInverter,
    PanelToInverterRatioResult,
    EnergyGenerationEstimate,
    SystemCompatibilityResult,
} from './types';
