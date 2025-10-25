/**
 * ANEEL Energy Tariffs API
 * 
 * GET /store/aneel/tariffs?concessionaire={name}
 * 
 * Retorna tarifas de energia elétrica por concessionária.
 * 
 * TODO: Implementar scraper real da ANEEL ou API externa
 * Por ora, usa tabela estática com tarifas médias 2025
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const concessionaire = req.query.concessionaire as string;

    if (!concessionaire || concessionaire.length < 2) {
        return res.status(400).json({
            error: "Missing or invalid concessionaire parameter",
        });
    }

    try {
        const tariff_data = getTariffByConcessionaireOrLocation(concessionaire);

        if (!tariff_data) {
            return res.status(404).json({
                error: "Tariff not found for concessionaire",
                concessionaire,
                message: "Use fallback: Média Brasil (R$ 0.85/kWh)",
            });
        }

        res.json(tariff_data);
    } catch (error: any) {
        console.error("[ANEEL Tariffs] Error:", error);
        res.status(500).json({
            error: "Failed to retrieve tariff data",
            message: error.message,
        });
    }
};

/**
 * Obter tarifa por concessionária ou localização
 * 
 * Fonte: ANEEL - Tarifas médias residenciais 2025 (B1)
 * https://www.aneel.gov.br/ranking-das-tarifas
 */
function getTariffByConcessionaireOrLocation(query: string): any {
    const normalized = query.toLowerCase().replace(/[-_]/g, " ").trim();

    // Tabela de concessionárias e tarifas (R$/kWh) - Atualizado 2025
    const tariffs: Record<string, any> = {
        // Região Sul
        copel: {
            tariff_kwh: 0.82,
            distributor_name: "Copel (Paraná)",
            state: "PR",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
        rge: {
            tariff_kwh: 0.89,
            distributor_name: "RGE (Rio Grande do Sul)",
            state: "RS",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
        celesc: {
            tariff_kwh: 0.87,
            distributor_name: "Celesc (Santa Catarina)",
            state: "SC",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },

        // Região Sudeste
        light: {
            tariff_kwh: 0.95,
            distributor_name: "Light (Rio de Janeiro)",
            state: "RJ",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
        enel: {
            tariff_kwh: 0.91,
            distributor_name: "Enel (São Paulo/Rio/Ceará)",
            state: "SP/RJ/CE",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
        cpfl: {
            tariff_kwh: 0.88,
            distributor_name: "CPFL (São Paulo)",
            state: "SP",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
        cemig: {
            tariff_kwh: 0.84,
            distributor_name: "Cemig (Minas Gerais)",
            state: "MG",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
        escelsa: {
            tariff_kwh: 0.86,
            distributor_name: "EDP ES (Espírito Santo)",
            state: "ES",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },

        // Região Nordeste
        coelba: {
            tariff_kwh: 0.79,
            distributor_name: "Coelba (Bahia)",
            state: "BA",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
        celpe: {
            tariff_kwh: 0.81,
            distributor_name: "Celpe (Pernambuco)",
            state: "PE",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
        cosern: {
            tariff_kwh: 0.83,
            distributor_name: "Cosern (Rio Grande do Norte)",
            state: "RN",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
        coelce: {
            tariff_kwh: 0.8,
            distributor_name: "Enel CE (Ceará)",
            state: "CE",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },

        // Região Centro-Oeste
        ceb: {
            tariff_kwh: 0.77,
            distributor_name: "CEB (Distrito Federal)",
            state: "DF",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
        celg: {
            tariff_kwh: 0.76,
            distributor_name: "Enel GO (Goiás)",
            state: "GO",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },

        // Região Norte
        celpa: {
            tariff_kwh: 0.92,
            distributor_name: "Celpa (Pará)",
            state: "PA",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
        eletronorte: {
            tariff_kwh: 0.94,
            distributor_name: "Eletronorte (Amazonas)",
            state: "AM",
            last_updated: "2025-01-01",
            source: "aneel-static-2025",
        },
    };

    // Buscar por nome da concessionária
    for (const [key, value] of Object.entries(tariffs)) {
        if (normalized.includes(key)) {
            return value;
        }
    }

    // Buscar por sigla de estado
    const state_tariffs: Record<string, string> = {
        pr: "copel",
        rs: "rge",
        sc: "celesc",
        rj: "light",
        sp: "enel",
        mg: "cemig",
        es: "escelsa",
        ba: "coelba",
        pe: "celpe",
        rn: "cosern",
        ce: "coelce",
        df: "ceb",
        go: "celg",
        pa: "celpa",
        am: "eletronorte",
    };

    for (const [state, concessionaire_key] of Object.entries(state_tariffs)) {
        if (normalized.includes(state)) {
            return tariffs[concessionaire_key];
        }
    }

    // Fallback: média Brasil
    return {
        tariff_kwh: 0.85,
        distributor_name: "Média Brasil",
        state: "N/A",
        last_updated: "2025-01-01",
        source: "fallback-average",
    };
}

/**
 * GET /store/aneel/tariffs/all
 * 
 * Lista todas as tarifas disponíveis
 */
export const getAllTariffs = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const all_tariffs = [
        { concessionaire: "copel", tariff_kwh: 0.82, state: "PR" },
        { concessionaire: "rge", tariff_kwh: 0.89, state: "RS" },
        { concessionaire: "celesc", tariff_kwh: 0.87, state: "SC" },
        { concessionaire: "light", tariff_kwh: 0.95, state: "RJ" },
        { concessionaire: "enel", tariff_kwh: 0.91, state: "SP/RJ/CE" },
        { concessionaire: "cpfl", tariff_kwh: 0.88, state: "SP" },
        { concessionaire: "cemig", tariff_kwh: 0.84, state: "MG" },
        { concessionaire: "escelsa", tariff_kwh: 0.86, state: "ES" },
        { concessionaire: "coelba", tariff_kwh: 0.79, state: "BA" },
        { concessionaire: "celpe", tariff_kwh: 0.81, state: "PE" },
        { concessionaire: "cosern", tariff_kwh: 0.83, state: "RN" },
        { concessionaire: "coelce", tariff_kwh: 0.8, state: "CE" },
        { concessionaire: "ceb", tariff_kwh: 0.77, state: "DF" },
        { concessionaire: "celg", tariff_kwh: 0.76, state: "GO" },
        { concessionaire: "celpa", tariff_kwh: 0.92, state: "PA" },
        { concessionaire: "eletronorte", tariff_kwh: 0.94, state: "AM" },
    ];

    res.json({
        tariffs: all_tariffs,
        count: all_tariffs.length,
        last_updated: "2025-01-01",
        source: "aneel-static-2025",
    });
};
