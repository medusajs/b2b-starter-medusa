"use server";
import "server-only";

import { sdk } from "@/lib/config";
import { getAuthHeaders, getCacheTag } from "@/lib/data/cookies";
import { revalidateTag } from "next/cache";

export type SolarQuoteInput = {
    customer_id: string;
    region_id: string;
    sales_channel_id?: string;

    solar_project: {
        capacity_kwp: number;
        irradiation_kwh_m2_day: number;
        roof_type: "ceramica" | "metalico" | "laje" | "fibrocimento";
        building_type: "residential" | "commercial" | "industrial" | "rural";
        roof_area_m2: number;
        address: {
            street: string;
            city: string;
            state: string;
            postal_code: string;
            latitude?: number;
            longitude?: number;
        };
    };

    items: Array<{
        product_id: string;
        variant_id: string;
        title: string;
        quantity: number;
        custom_price?: number;
        custom_discount_percentage?: number;
        metadata?: Record<string, any>;
    }>;

    discounts?: Array<{
        code?: string;
        amount?: number;
        percentage?: number;
        description: string;
    }>;

    metadata?: Record<string, any>;
};

export type SolarQuoteResponse = {
    draft_order: {
        id: string;
        status: string;
        customer_id: string;
        metadata: Record<string, any>;
    };
    project_metrics: {
        roi_percentage: string;
        payback_years: string;
        estimated_generation_kwh_year: number;
    };
    complexity_multiplier: number;
    feasibility_validation: {
        is_feasible: boolean;
        validation_errors: string[];
        validated_at: string;
    };
    message: string;
};

/**
 * Cria cotação solar usando Draft Orders com preços customizados
 * 
 * Features do backend (v2.10.0):
 * - Preços ajustados por tipo de telhado (cerâmica, metálico, laje, fibrocimento)
 * - Multiplicadores por tipo de construção (residential, commercial, industrial, rural)
 * - Validação automática de viabilidade (irradiação mínima, área necessária)
 * - Cálculo de ROI, payback e geração estimada
 */
export const createSolarQuote = async (
    input: SolarQuoteInput
): Promise<{ success: boolean; data?: SolarQuoteResponse; error?: string }> => {
    const headers = { ...(await getAuthHeaders()) };

    try {
        const response = await sdk.client.fetch<SolarQuoteResponse>(
            `/store/solar-quotes`,
            {
                method: "POST",
                headers: {
                    ...headers,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(input),
            }
        );

        // Revalidar cache de orders
        const ordersTag = await getCacheTag("orders");
        revalidateTag(ordersTag);

        return {
            success: true,
            data: response,
        };
    } catch (error: any) {
        console.error("Error creating solar quote:", error);

        // Extrair mensagem de erro
        let errorMessage = "Falha ao criar cotação";

        if (error.response?.data?.error) {
            errorMessage = error.response.data.error;

            // Se não é viável, incluir erros de validação
            if (error.response.data.validation_errors) {
                errorMessage += ": " + error.response.data.validation_errors.join(", ");
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Lista cotações solares do cliente
 */
export const getCustomerSolarQuotes = async (
    customer_id: string
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
    const headers = { ...(await getAuthHeaders()) };

    try {
        const response = await sdk.client.fetch<{ orders: any[] }>(
            `/admin/solar/orders?customer_id=${customer_id}&status=draft`,
            {
                method: "GET",
                headers,
                next: {
                    tags: ["orders", `customer-${customer_id}`],
                },
            }
        );

        return {
            success: true,
            data: response.orders,
        };
    } catch (error: any) {
        console.error("Error fetching solar quotes:", error);

        return {
            success: false,
            error: error.message || "Falha ao buscar cotações",
        };
    }
};