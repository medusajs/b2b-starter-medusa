/**
 * Solar Viability API
 * 
 * GET /store/solar/viability?location={city,state}
 * 
 * Verifica viabilidade técnica de instalação solar baseado em:
 * - Irradiação solar média da região
 * - Peak sun hours
 * - Feasibility score
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const location = req.query.location as string;

    if (!location || location.length < 3) {
        return res.status(400).json({
            error: "Missing or invalid location parameter",
        });
    }

    try {
        // TODO: Integrar com API CRESESB/INPE
        const irradiation_data = await getSolarIrradiationData(location);

        // Calcular feasibility score (0-100)
        const feasibility_score = calculateFeasibilityScore(irradiation_data);

        // Determinar viabilidade (>= 3.5 kWh/m²/dia é viável)
        const viable = irradiation_data.irradiation_kwh_m2_day >= 3.5;

        // Gerar recomendações
        const recommendations = generateRecommendations(irradiation_data, viable);

        res.json({
            viable,
            location,
            irradiation_kwh_m2_day: irradiation_data.irradiation_kwh_m2_day,
            peak_sun_hours: irradiation_data.peak_sun_hours,
            feasibility_score,
            recommendations,
            data_source: irradiation_data.source,
        });
    } catch (error: any) {
        console.error("[Solar Viability] Error:", error);
        res.status(500).json({
            error: "Failed to check solar viability",
            message: error.message,
        });
    }
};

/**
 * Obter dados de irradiação solar
 * TODO: Integrar com CRESESB API
 */
async function getSolarIrradiationData(location: string) {
    // Parse location (ex: "São Paulo, SP" ou "Curitiba-PR")
    const normalized = location.toLowerCase().replace(/[-,]/g, " ").trim();

    // Dados de irradiação por estado (fallback)
    // Fonte: Atlas Solarimétrico do Brasil (CRESESB)
    const state_averages: Record<string, number> = {
        ac: 5.0, // Acre
        al: 5.8,
        ap: 5.1,
        am: 4.8,
        ba: 6.0, // Bahia (maior irradiação)
        ce: 5.7,
        df: 5.4,
        es: 5.2,
        go: 5.5,
        ma: 5.6,
        mt: 5.5,
        ms: 5.4,
        mg: 5.3,
        pa: 5.2,
        pb: 5.9,
        pr: 4.9,
        pe: 5.9,
        pi: 5.8,
        rj: 5.0,
        rn: 5.9,
        rs: 4.7, // Rio Grande do Sul (menor irradiação)
        ro: 5.1,
        rr: 5.2,
        sc: 4.6,
        sp: 5.2,
        se: 5.8,
        to: 5.6,
    };

    // Tentar extrair sigla do estado
    const state_match = normalized.match(/\b(ac|al|ap|am|ba|ce|df|es|go|ma|mt|ms|mg|pa|pb|pr|pe|pi|rj|rn|rs|ro|rr|sc|sp|se|to)\b/);
    const state = state_match ? state_match[1] : null;

    const irradiation_kwh_m2_day = state
        ? state_averages[state]
        : 5.2; // média Brasil

    return {
        irradiation_kwh_m2_day,
        peak_sun_hours: irradiation_kwh_m2_day * 0.95, // Aproximação
        source: state ? `state-average-${state.toUpperCase()}` : "fallback-brazil-average",
    };
}

/**
 * Calcular feasibility score (0-100)
 */
function calculateFeasibilityScore(data: {
    irradiation_kwh_m2_day: number;
    peak_sun_hours: number;
}) {
    // Score baseado em irradiação:
    // < 3.5: 0-40 (inviável)
    // 3.5-4.5: 40-70 (marginal)
    // 4.5-5.5: 70-90 (bom)
    // > 5.5: 90-100 (excelente)

    if (data.irradiation_kwh_m2_day < 3.5) {
        return Math.round((data.irradiation_kwh_m2_day / 3.5) * 40);
    } else if (data.irradiation_kwh_m2_day < 4.5) {
        return Math.round(40 + ((data.irradiation_kwh_m2_day - 3.5) / 1.0) * 30);
    } else if (data.irradiation_kwh_m2_day < 5.5) {
        return Math.round(70 + ((data.irradiation_kwh_m2_day - 4.5) / 1.0) * 20);
    } else {
        return Math.round(
            Math.min(100, 90 + ((data.irradiation_kwh_m2_day - 5.5) / 0.5) * 10)
        );
    }
}

/**
 * Gerar recomendações baseadas em viabilidade
 */
function generateRecommendations(
    data: { irradiation_kwh_m2_day: number },
    viable: boolean
): string[] {
    const recommendations: string[] = [];

    if (!viable) {
        recommendations.push(
            "❌ Irradiação solar abaixo do mínimo recomendado (3.5 kWh/m²/dia)"
        );
        recommendations.push(
            "💡 Considere aumentar a capacidade do sistema para compensar baixa irradiação"
        );
        recommendations.push(
            "🔍 Verifique obstruções (sombras de árvores, prédios, montanhas)"
        );
    } else if (data.irradiation_kwh_m2_day < 4.5) {
        recommendations.push(
            "⚠️ Irradiação marginal. Payback pode ser mais longo."
        );
        recommendations.push(
            "💰 Aproveite incentivos fiscais para melhorar viabilidade econômica"
        );
    } else if (data.irradiation_kwh_m2_day < 5.5) {
        recommendations.push("✅ Irradiação boa. Sistema será altamente eficiente.");
        recommendations.push(
            "📈 ROI esperado entre 15-20% ao ano"
        );
    } else {
        recommendations.push(
            "🌟 Irradiação excelente! Uma das melhores regiões do Brasil."
        );
        recommendations.push(
            "💎 Considere sistema maior para maximizar retorno"
        );
        recommendations.push("⚡ Potencial para venda de excedente energético");
    }

    return recommendations;
}
