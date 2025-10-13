"use server";
import "server-only";
import { sdk } from "@/lib/config";
import { getAuthHeaders, getCacheOptions } from "@/lib/data/cookies";

export type SolarCalculationInput = {
    consumption_kwh_month: number;
    location: string;
    roof_type: "ceramica" | "fibrocimento" | "metalico" | "laje";
    roof_area_m2?: number;
    building_type?: "residencial" | "comercial" | "industrial" | "rural";
};

export type SolarCalculationResult = {
    recommended_capacity_kwp: number;
    panel_quantity: number;
    inverter_capacity_kw: number;
    estimated_cost: number;
    payback_years: number;
    monthly_savings: number;
    annual_generation_kwh: number;
    co2_offset_tons_year: number;
    recommended_products: {
        panels: any[];
        inverters: any[];
        accessories: any[];
    };
    financing_options?: {
        installments: number;
        monthly_payment: number;
        total_with_interest: number;
    }[];
};

export const calculateSolarSystem = async (
    input: SolarCalculationInput
): Promise<SolarCalculationResult> => {
    const headers = { ...(await getAuthHeaders()) };
    const next = { ...(await getCacheOptions("solar-calculations")) };

    try {
        const response = await sdk.client.fetch<{ calculation: SolarCalculationResult }>(
            `/store/solar/calculate`,
            {
                method: "POST",
                body: JSON.stringify(input),
                headers,
                next,
            }
        );

        return response.calculation;
    } catch (error) {
        console.error("Failed to calculate solar system:", error);
        throw error;
    }
};

export const getSolarViability = async (location: string) => {
    const headers = { ...(await getAuthHeaders()) };

    try {
        const response = await sdk.client.fetch<{
            viable: boolean;
            irradiation_kwh_m2_day: number;
            peak_sun_hours: number;
            feasibility_score: number;
            recommendations: string[];
        }>(`/store/solar/viability?location=${encodeURIComponent(location)}`, {
            method: "GET",
            headers,
            next: { revalidate: 86400 }, // Cache por 24h
        });

        return response;
    } catch (error) {
        console.error("Failed to get solar viability:", error);
        throw error;
    }
};

export const getEnergyTariff = async (concessionaire: string) => {
    try {
        const response = await sdk.client.fetch<{
            tariff_kwh: number;
            distributor_name: string;
            state: string;
            last_updated: string;
        }>(`/store/aneel/tariffs?concessionaire=${encodeURIComponent(concessionaire)}`, {
            method: "GET",
            next: { revalidate: 3600 }, // Cache por 1h
        });

        return response;
    } catch (error) {
        console.error("Failed to get energy tariff:", error);
        throw error;
    }
};