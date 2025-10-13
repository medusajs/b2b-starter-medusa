"use server";
import "server-only";

import { sdk } from "@/lib/config";
import { getAuthHeaders } from "@/lib/data/cookies";

export type SolarFeasibilityValidation = {
  is_feasible: boolean;
  blocking_errors: string[];
  warnings: string[];
  validation_details: {
    irradiation_check: {
      passed: boolean;
      value: number;
      minimum: number;
    };
    roof_area_check: {
      passed: boolean;
      available_m2: number;
      required_m2: number;
    };
    capacity_check: {
      passed: boolean;
      value_kwp: number;
      minimum_kwp: number;
    };
    crane_required: boolean;
    distance_km?: number;
    installation_complexity: "low" | "medium" | "high" | "very_high";
  };
  message: string;
};

/**
 * Valida viabilidade técnica de projeto solar
 * 
 * Deve ser chamado antes do checkout para garantir que o projeto
 * atende os requisitos mínimos:
 * - Irradiação solar ≥ 3.5 kWh/m²/dia
 * - Área de telhado suficiente (~7m² por kWp)
 * - Capacidade viável (≥ 1.5 kWp)
 * 
 * @param cart_id - ID do carrinho a ser validado
 * @returns Resultado da validação com erros bloqueantes e warnings
 */
export const validateSolarFeasibility = async (
  cart_id: string
): Promise<{ success: boolean; data?: SolarFeasibilityValidation; error?: string }> => {
  const headers = { ...(await getAuthHeaders()) };

  try {
    const response = await sdk.client.fetch<SolarFeasibilityValidation>(
      `/store/solar/validate-feasibility`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart_id }),
      }
    );

    return {
      success: response.is_feasible,
      data: response,
    };
  } catch (error: any) {
    console.error("Error validating solar feasibility:", error);

    // Se foi erro 422 (Unprocessable Entity), o projeto não é viável
    if (error.response?.status === 422 && error.response?.data) {
      return {
        success: false,
        data: error.response.data as SolarFeasibilityValidation,
      };
    }

    return {
      success: false,
      error: error.message || "Falha ao validar viabilidade do projeto",
    };
  }
};