/**
 * 🔐 ANEEL Tariff Module - Zod Validators
 * Validação de input para APIs e métodos públicos
 */

import { z } from "zod";
import { GrupoTarifa, ModalidadeTarifa, ClasseConsumidor, BandeiraTarifaria, UF } from "./types/enums";

/**
 * Validator: Query de tarifa vigente
 */
export const TarifaVigenteQuerySchema = z.object({
    uf: z.nativeEnum(UF, { errorMap: () => ({ message: "UF inválida" }) }),
    grupo: z.nativeEnum(GrupoTarifa).optional().default(GrupoTarifa.B1),
    classe: z.nativeEnum(ClasseConsumidor).optional().default(ClasseConsumidor.RESIDENCIAL),
    modalidade: z.nativeEnum(ModalidadeTarifa).optional(),
    concessionaria_sigla: z.string().max(50).optional(),
    data_referencia: z.coerce.date().optional(),
});

export type TarifaVigenteQueryInput = z.infer<typeof TarifaVigenteQuerySchema>;

/**
 * Validator: Cálculo de custo anual
 */
export const CustoAnualInputSchema = z.object({
    uf: z.nativeEnum(UF),
    consumo_mensal_kwh: z.number().positive({ message: "Consumo deve ser > 0" }).max(100000, {
        message: "Consumo mensal máximo: 100.000 kWh",
    }),
    grupo: z.nativeEnum(GrupoTarifa).optional().default(GrupoTarifa.B1),
    classe: z.nativeEnum(ClasseConsumidor).optional().default(ClasseConsumidor.RESIDENCIAL),
    bandeira_media: z.nativeEnum(BandeiraTarifaria).optional().default(BandeiraTarifaria.AMARELA),
    concessionaria_sigla: z.string().max(50).optional(),
});

export type CustoAnualInput = z.infer<typeof CustoAnualInputSchema>;

/**
 * Validator: Cálculo de economia solar
 */
export const EconomiaSolarInputSchema = z.object({
    uf: z.nativeEnum(UF),
    consumo_mensal_kwh: z.number().positive().max(100000),
    geracao_mensal_kwh: z.number().positive().max(100000),
    grupo: z.nativeEnum(GrupoTarifa).optional().default(GrupoTarifa.B1),
    classe: z.nativeEnum(ClasseConsumidor).optional().default(ClasseConsumidor.RESIDENCIAL),
    concessionaria_sigla: z.string().max(50).optional(),
    custo_sistema: z.number().positive().optional(),
});

export type EconomiaSolarInput = z.infer<typeof EconomiaSolarInputSchema>;

/**
 * Validator: Batch query
 */
export const TarifasBatchQuerySchema = z.object({
    ufs: z.array(z.nativeEnum(UF)).min(1).max(27, {
        message: "Máximo de 27 UFs por batch",
    }),
    grupo: z.nativeEnum(GrupoTarifa).optional().default(GrupoTarifa.B1),
    classe: z.nativeEnum(ClasseConsumidor).optional().default(ClasseConsumidor.RESIDENCIAL),
});

export type TarifasBatchQueryInput = z.infer<typeof TarifasBatchQuerySchema>;

/**
 * Validator: Query string de API (GET /api/aneel/tariffs)
 */
export const GetTariffsQuerySchema = z.object({
    uf: z.string().length(2).toUpperCase().refine((val) => Object.values(UF).includes(val as UF), {
        message: "UF inválida",
    }),
    grupo: z.string().optional().default("B1"),
    classe: z.string().optional().default("residencial"),
    concessionaria: z.string().optional(),
});

/**
 * Validator: CEP brasileiro
 */
export const CEPSchema = z.string().regex(/^\d{5}-?\d{3}$/, {
    message: "CEP inválido. Formato: 12345-678 ou 12345678",
});

/**
 * Validator: Sigla de concessionária
 */
export const ConcessionariaSiglaSchema = z.string().min(2).max(50).toUpperCase();

/**
 * Validator: Range de datas
 */
export const DateRangeSchema = z.object({
    inicio: z.coerce.date(),
    fim: z.coerce.date(),
}).refine((data) => data.fim >= data.inicio, {
    message: "Data de fim deve ser >= data de início",
});

/**
 * Validator: Potência de sistema MMGD
 */
export const PotenciaMMGDSchema = z.number().positive().max(5000, {
    message: "Potência máxima MMGD: 5000 kWp (minigeração)",
});

/**
 * Helper: Normalizar UF
 */
export function normalizeUF(uf: string): UF {
    const normalized = uf.toUpperCase().trim();
    if (!Object.values(UF).includes(normalized as UF)) {
        throw new Error(`UF inválida: ${uf}`);
    }
    return normalized as UF;
}

/**
 * Helper: Normalizar CEP
 */
export function normalizeCEP(cep: string): string {
    return cep.replace(/\D/g, ""); // Remove não-dígitos
}

/**
 * Helper: Validar oversizing MMGD
 */
export function validateOversizing(potencia_sistema_kwp: number, consumo_anual_kwh: number): {
    valid: boolean;
    oversizing_pct: number;
    message?: string;
} {
    const geracao_anual_estimada_kwh = potencia_sistema_kwp * 1500; // 1500 kWh/kWp/ano média Brasil
    const oversizing_pct = (geracao_anual_estimada_kwh / consumo_anual_kwh) * 100;

    if (oversizing_pct < 114) {
        return {
            valid: false,
            oversizing_pct,
            message: "Oversizing mínimo: 114% (Marco Legal MMGD)",
        };
    }

    if (oversizing_pct > 160) {
        return {
            valid: false,
            oversizing_pct,
            message: "Oversizing máximo: 160% (limite ANEEL)",
        };
    }

    return { valid: true, oversizing_pct };
}
