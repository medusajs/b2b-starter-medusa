import { Unit } from "../../../types/pvlib";

/**
 * Unit Normalizer - Converte unidades de diferentes providers para padrão SI
 * 
 * Padrão SI adotado:
 * - Irradiância: W/m²
 * - Energia: kWh
 * - Temperatura: °C
 * - Eficiência: % (0-100)
 */
export class UnitNormalizer {
    /**
     * Converter irradiância para W/m²
     */
    static normalizeIrradiance(value: number, fromUnit: Unit): number {
        switch (fromUnit) {
            case Unit.W_PER_M2:
                return value; // Já está no padrão

            case Unit.KW_PER_M2:
                return value * 1000; // kW/m² → W/m²

            case Unit.MJ_PER_M2:
                // MJ/m²/day → W/m² (assumindo day = 24h)
                return (value * 1000000) / (24 * 3600); // MJ → W/s (over 24h)

            default:
                throw new Error(`Unsupported irradiance unit: ${fromUnit}`);
        }
    }

    /**
     * Converter energia para kWh
     */
    static normalizeEnergy(value: number, fromUnit: Unit): number {
        switch (fromUnit) {
            case Unit.KWH:
                return value; // Já está no padrão

            case Unit.WH:
                return value / 1000; // Wh → kWh

            case Unit.MWH:
                return value * 1000; // MWh → kWh

            default:
                throw new Error(`Unsupported energy unit: ${fromUnit}`);
        }
    }

    /**
     * Converter temperatura para °C
     */
    static normalizeTemperature(value: number, fromUnit: Unit): number {
        switch (fromUnit) {
            case Unit.CELSIUS:
                return value; // Já está no padrão

            case Unit.FAHRENHEIT:
                return ((value - 32) * 5) / 9; // °F → °C

            case Unit.KELVIN:
                return value - 273.15; // K → °C

            default:
                throw new Error(`Unsupported temperature unit: ${fromUnit}`);
        }
    }

    /**
     * Converter eficiência para % (0-100)
     */
    static normalizeEfficiency(value: number, fromUnit: Unit): number {
        switch (fromUnit) {
            case Unit.PERCENT:
                return value; // Já está no padrão

            case Unit.DECIMAL:
                return value * 100; // 0.15 → 15%

            default:
                throw new Error(`Unsupported efficiency unit: ${fromUnit}`);
        }
    }

    /**
     * Detectar unidade de string (provider-specific)
     */
    static detectUnit(unitString: string): Unit {
        const normalized = unitString.toLowerCase().trim();

        // Irradiância - Check kW first to avoid false positive with W
        if (normalized.includes("kw/m") || normalized.includes("kwm") || normalized === "kwm2") {
            return Unit.KW_PER_M2;
        }
        if (normalized.includes("w/m") || normalized.includes("wm") || normalized === "wm2") {
            return Unit.W_PER_M2;
        }
        if (normalized.includes("mj/m") || normalized === "mjm2") {
            return Unit.MJ_PER_M2;
        }

        // Energia
        if (normalized === "wh" || normalized === "watthour") {
            return Unit.WH;
        }
        if (normalized === "kwh" || normalized === "kilowatthour") {
            return Unit.KWH;
        }
        if (normalized === "mwh" || normalized === "megawatthour") {
            return Unit.MWH;
        }

        // Temperatura
        if (normalized === "c" || normalized === "celsius" || normalized === "°c") {
            return Unit.CELSIUS;
        }
        if (normalized === "f" || normalized === "fahrenheit" || normalized === "°f") {
            return Unit.FAHRENHEIT;
        }
        if (normalized === "k" || normalized === "kelvin") {
            return Unit.KELVIN;
        }

        // Eficiência
        if (normalized === "%" || normalized === "percent" || normalized === "percentage") {
            return Unit.PERCENT;
        }
        if (normalized === "decimal" || normalized === "fraction") {
            return Unit.DECIMAL;
        }

        throw new Error(`Cannot detect unit from string: ${unitString}`);
    }

    /**
     * Conversão automática detectando unidade
     */
    static autoNormalizeIrradiance(value: number, unitString: string): number {
        const unit = this.detectUnit(unitString);
        return this.normalizeIrradiance(value, unit);
    }

    static autoNormalizeEnergy(value: number, unitString: string): number {
        const unit = this.detectUnit(unitString);
        return this.normalizeEnergy(value, unit);
    }

    static autoNormalizeTemperature(value: number, unitString: string): number {
        const unit = this.detectUnit(unitString);
        return this.normalizeTemperature(value, unit);
    }

    static autoNormalizeEfficiency(value: number, unitString: string): number {
        const unit = this.detectUnit(unitString);
        return this.normalizeEfficiency(value, unit);
    }
}
