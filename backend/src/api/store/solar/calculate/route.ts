/**
 * Solar System Calculator API
 * 
 * POST /store/solar/calculate
 * 
 * Calcula dimensionamento de sistema solar fotovoltaico baseado em:
 * - Consumo mensal (kWh)
 * - Localização (cidade/estado)
 * - Tipo de telhado
 * - Área disponível
 * - Tipo de construção
 */

import type {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http";
import { z } from "zod";

// Validation Schema
const CalculateSolarSystemSchema = z.object({
    consumption_kwh_month: z.number().min(50).max(100000),
    location: z.string().min(3).max(200),
    roof_type: z.enum(["ceramica", "fibrocimento", "metalico", "laje"]),
    roof_area_m2: z.number().optional(),
    building_type: z
        .enum(["residencial", "comercial", "industrial", "rural"])
        .optional(),
});

type CalculateSolarSystemInput = z.infer<typeof CalculateSolarSystemSchema>;

export const POST = async (
    req: AuthenticatedMedusaRequest<CalculateSolarSystemInput>,
    res: MedusaResponse
) => {
    // Validate input
    const validationResult = CalculateSolarSystemSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            error: "Invalid input",
            details: validationResult.error.errors,
        });
    }

    const input = validationResult.data;

    try {
        // 1. Obter irradiação solar da localização (usando CRESESB/INPE API ou fallback)
        const irradiation = await getSolarIrradiation(input.location);

        // 2. Calcular capacidade necessária (kWp)
        const daily_consumption_kwh = input.consumption_kwh_month / 30;
        const generation_factor = irradiation.peak_sun_hours * 0.8; // 80% efficiency
        const recommended_capacity_kwp = daily_consumption_kwh / generation_factor;

        // 3. Calcular quantidade de painéis (média 550Wp por painel)
        const panel_wattage = 550;
        const panel_quantity = Math.ceil(
            (recommended_capacity_kwp * 1000) / panel_wattage
        );

        // 4. Calcular capacidade do inversor (80-90% da potência dos painéis)
        const inverter_capacity_kw = recommended_capacity_kwp * 0.85;

        // 5. Calcular área necessária (~7m² por kWp)
        const required_area_m2 = recommended_capacity_kwp * 7;

        // 6. Validar área disponível
        if (input.roof_area_m2 && input.roof_area_m2 < required_area_m2) {
            return res.status(422).json({
                error: "Insufficient roof area",
                required_area_m2,
                available_area_m2: input.roof_area_m2,
                message: `Área insuficiente. Necessário ${required_area_m2.toFixed(1)}m², disponível ${input.roof_area_m2}m²`,
            });
        }

        // 7. Calcular geração anual (kWh)
        const annual_generation_kwh =
            recommended_capacity_kwp * irradiation.annual_avg_kwh_m2_day * 365 * 0.8;

        // 8. Obter tarifa elétrica (R$/kWh)
        const tariff = await getEnergyTariff(input.location);

        // 9. Calcular economia mensal e payback
        const monthly_savings = (annual_generation_kwh / 12) * tariff.tariff_kwh;

        // 10. Calcular custo estimado baseado em tipo de telhado/construção
        const base_cost_per_kwp = 5000; // R$ 5.000/kWp base
        const roof_multiplier = getRoofMultiplier(input.roof_type);
        const building_multiplier = getBuildingMultiplier(
            input.building_type || "residencial"
        );
        const estimated_cost =
            recommended_capacity_kwp *
            base_cost_per_kwp *
            roof_multiplier *
            building_multiplier;

        const payback_years = estimated_cost / (monthly_savings * 12);

        // 11. Calcular offset de CO2 (0.5 kg CO2/kWh no Brasil)
        const co2_offset_tons_year = (annual_generation_kwh * 0.5) / 1000;

        // 12. Buscar produtos recomendados (TODO: query real products)
        const recommended_products = {
            panels: [
                {
                    name: "Painel Solar 550W Monocristalino",
                    quantity: panel_quantity,
                    unit_price: 850,
                    total_price: panel_quantity * 850,
                },
            ],
            inverters: [
                {
                    name: `Inversor ${inverter_capacity_kw.toFixed(1)}kW`,
                    quantity: 1,
                    unit_price: inverter_capacity_kw * 1200,
                    total_price: inverter_capacity_kw * 1200,
                },
            ],
            accessories: [
                {
                    name: "Kit Estrutura de Fixação",
                    quantity: 1,
                    unit_price: panel_quantity * 80,
                    total_price: panel_quantity * 80,
                },
            ],
        };

        // 13. Calcular opções de financiamento
        const financing_options = calculateFinancing(estimated_cost);

        const calculation = {
            recommended_capacity_kwp: Math.round(recommended_capacity_kwp * 100) / 100,
            panel_quantity,
            inverter_capacity_kw: Math.round(inverter_capacity_kw * 100) / 100,
            estimated_cost: Math.round(estimated_cost),
            payback_years: Math.round(payback_years * 10) / 10,
            monthly_savings: Math.round(monthly_savings),
            annual_generation_kwh: Math.round(annual_generation_kwh),
            co2_offset_tons_year: Math.round(co2_offset_tons_year * 100) / 100,
            recommended_products,
            financing_options,
            irradiation_data: irradiation,
            tariff_data: tariff,
        };

        res.json({ calculation });
    } catch (error: any) {
        console.error("[Solar Calculator] Error:", error);
        res.status(500).json({
            error: "Failed to calculate solar system",
            message: error.message,
        });
    }
};

/**
 * Obter irradiação solar da localização
 * TODO: Integrar com API CRESESB/INPE real
 */
async function getSolarIrradiation(location: string) {
    // Fallback: média brasileira
    // TODO: Parser location (cidade, estado) e consultar API CRESESB
    return {
        location,
        peak_sun_hours: 5.2, // média Brasil
        annual_avg_kwh_m2_day: 5.5,
        source: "fallback-average",
    };
}

/**
 * Obter tarifa elétrica da concessionaire
 * TODO: Integrar com scraper ANEEL real
 */
async function getEnergyTariff(location: string) {
    // Fallback: média brasileira 2025
    return {
        tariff_kwh: 0.85,
        distributor_name: "Média Brasil",
        state: "N/A",
        last_updated: new Date().toISOString(),
        source: "fallback-average",
    };
}

/**
 * Multiplicador de custo por tipo de telhado
 */
function getRoofMultiplier(roof_type: string): number {
    const multipliers: Record<string, number> = {
        ceramica: 1.0, // Base
        fibrocimento: 1.05, // Estrutura especial
        metalico: 0.95, // Mais fácil
        laje: 1.1, // Estrutura elevada
    };
    return multipliers[roof_type] || 1.0;
}

/**
 * Multiplicador de custo por tipo de construção
 */
function getBuildingMultiplier(building_type: string): number {
    const multipliers: Record<string, number> = {
        residencial: 1.0,
        comercial: 1.15, // Logística + docs
        industrial: 1.25, // Complexidade + segurança
        rural: 1.2, // Distância + acesso
    };
    return multipliers[building_type] || 1.0;
}

/**
 * Calcular opções de financiamento
 */
function calculateFinancing(total_cost: number) {
    const options = [12, 24, 36, 48, 60]; // meses
    const annual_interest_rate = 0.15; // 15% a.a.

    return options.map((months) => {
        const monthly_rate = annual_interest_rate / 12;
        const monthly_payment =
            (total_cost * monthly_rate * Math.pow(1 + monthly_rate, months)) /
            (Math.pow(1 + monthly_rate, months) - 1);

        return {
            installments: months,
            monthly_payment: Math.round(monthly_payment),
            total_with_interest: Math.round(monthly_payment * months),
            interest_amount: Math.round(monthly_payment * months - total_cost),
        };
    });
}
