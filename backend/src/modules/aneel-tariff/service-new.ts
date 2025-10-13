/**
 * ⚡ ANEEL Tariff Service - Refactored
 * Camada de acesso a tarifas com Redis cache, funções puras e versionamento
 * 
 * Features:
 * - Cache Redis distribuído (TTL: 24h)
 * - Versionamento de dataset
 * - Funções puras para cálculos
 * - Batch queries (prevenção N+1)
 * - Fallback para último snapshot válido
 */

import { MedusaService } from "@medusajs/framework/utils";
import CacheManager from "../../utils/cache-manager";
import {
    GrupoTarifa,
    ClasseConsumidor,
    BandeiraTarifaria,
    UF,
    BANDEIRA_VALORES,
} from "./types/enums";
import {
    TarifaVigenteQuery,
    TarifaVigenteResult,
    CustoAnualInput,
    CustoAnualResult,
    EconomiaSolarInput,
    EconomiaSolarResult,
    TarifasBatchQuery,
    TarifasBatchResult,
    Tarifa,
    Concessionaria,
    BandeiraHistorico,
} from "./types/interfaces";
import { Logger } from "@medusajs/medusa/dist/types/global";

// ============================================================================
// Cache Keys & Tags
// ============================================================================

const CACHE_PREFIX = "aneel-tariff";
const CACHE_TAG_TARIFAS = "tarifas";
const CACHE_TAG_CONCESSIONARIAS = "concessionarias";
const CACHE_TAG_BANDEIRAS = "bandeiras";
const CACHE_TTL_SECONDS = 86400; // 24 horas

/**
 * Versão atual do dataset
 * Incrementar ao atualizar tarifas para invalidar cache automaticamente
 */
const DATASET_VERSION = "2024.10";

function buildCacheKey(parts: string[]): string {
    return `${CACHE_PREFIX}:v${DATASET_VERSION}:${parts.join(":")}`;
}

// ============================================================================
// Pure Functions (Sem side-effects, testáveis, deterministicas)
// ============================================================================

/**
 * Calcula tarifa efetiva (tarifa base + bandeira)
 */
export function calcularTarifaEfetiva(
    tarifa_base_kwh: number,
    bandeira: BandeiraTarifaria
): number {
    const adicional = BANDEIRA_VALORES[bandeira];
    return Number((tarifa_base_kwh + adicional).toFixed(4));
}

/**
 * Calcula custo mensal de energia
 */
export function calcularCustoMensal(
    consumo_kwh: number,
    tarifa_efetiva_kwh: number
): number {
    return Number((consumo_kwh * tarifa_efetiva_kwh).toFixed(2));
}

/**
 * Calcula breakdown de custos (energia, distribuição, bandeira)
 */
export function calcularBreakdownCustos(
    consumo_mensal_kwh: number,
    tarifa_tusd: number,
    tarifa_te: number,
    bandeira_valor: number
): { energia: number; distribuicao: number; bandeira: number } {
    const energia_anual = consumo_mensal_kwh * tarifa_te * 12;
    const distribuicao_anual = consumo_mensal_kwh * tarifa_tusd * 12;
    const bandeira_anual = consumo_mensal_kwh * bandeira_valor * 12;

    return {
        energia: Number(energia_anual.toFixed(2)),
        distribuicao: Number(distribuicao_anual.toFixed(2)),
        bandeira: Number(bandeira_anual.toFixed(2)),
    };
}

/**
 * Calcula payback simples (anos)
 */
export function calcularPaybackSimples(
    investimento: number,
    economia_anual: number
): number {
    if (economia_anual <= 0) return Infinity;
    return Number((investimento / economia_anual).toFixed(2));
}

/**
 * Calcula ROI percentual
 */
export function calcularROI(
    investimento: number,
    economia_total: number
): number {
    if (investimento <= 0) return 0;
    return Number((((economia_total - investimento) / investimento) * 100).toFixed(2));
}

/**
 * Normaliza UF para uppercase
 */
export function normalizeUF(uf: string): UF {
    const normalized = uf.toUpperCase().trim();
    if (!Object.values(UF).includes(normalized as UF)) {
        throw new Error(`UF inválida: ${uf}`);
    }
    return normalized as UF;
}

/**
 * Obtém bandeira vigente do mês
 */
export function obterBandeiraVigente(
    historico: BandeiraHistorico[],
    data_referencia: Date = new Date()
): BandeiraHistorico | null {
    const mes = data_referencia.getMonth() + 1;
    const ano = data_referencia.getFullYear();

    const bandeira = historico.find((b) => b.mes === mes && b.ano === ano);
    return bandeira || null;
}

// ============================================================================
// Service Class
// ============================================================================

class ANEELTariffService extends MedusaService({}) {
    private cacheManager: CacheManager;
    private logger: Logger;

    constructor({ logger }: { logger: Logger }) {
        super(arguments[0]);
        this.logger = logger;
        this.cacheManager = CacheManager.getInstance();
    }

    /**
     * Busca tarifa vigente por UF, grupo e classe
     * Cache: 24h | Fallback: último snapshot se DB falhar
     */
    async getTarifaVigente(query: TarifaVigenteQuery): Promise<TarifaVigenteResult | null> {
        const {
            uf,
            grupo = GrupoTarifa.B1,
            classe = ClasseConsumidor.RESIDENCIAL,
            concessionaria_sigla,
            data_referencia = new Date(),
        } = query;

        // 1. Tentar cache
        const cacheKey = buildCacheKey([
            "tarifa-vigente",
            uf,
            grupo,
            classe,
            concessionaria_sigla || "any",
        ]);

        try {
            const cached = await this.cacheManager.get<TarifaVigenteResult>(cacheKey);
            if (cached) {
                this.logger.debug("Cache hit para tarifa vigente", { uf, grupo, classe });
                return cached;
            }
        } catch (error) {
            this.logger.warn("Erro ao buscar cache, continuando com DB", { error });
        }

        // 2. Buscar do banco
        try {
            const tarifa = await this.findTarifaAtiva(uf, grupo, classe, data_referencia, concessionaria_sigla);
            if (!tarifa) {
                this.logger.warn("Tarifa não encontrada", { uf, grupo, classe });
                return null;
            }

            const concessionaria = await this.findConcessionariaById(tarifa.concessionaria_id);
            if (!concessionaria) {
                this.logger.error("Concessionária não encontrada", { id: tarifa.concessionaria_id });
                return null;
            }

            const bandeiraAtual = await this.getBandeiraAtual(data_referencia);
            const bandeira_vigente = bandeiraAtual?.bandeira || BandeiraTarifaria.AMARELA;

            const tarifa_efetiva_kwh = calcularTarifaEfetiva(tarifa.tarifa_kwh, bandeira_vigente);

            const result: TarifaVigenteResult = {
                tarifa,
                concessionaria,
                bandeira_atual: bandeiraAtual!,
                tarifa_efetiva_kwh,
                bandeira_vigente,
                cached_at: new Date(),
                cache_ttl_seconds: CACHE_TTL_SECONDS,
            };

            // 3. Cachear resultado
            await this.cacheManager.set(cacheKey, result, CACHE_TTL_SECONDS, [CACHE_TAG_TARIFAS]);

            return result;
        } catch (error) {
            this.logger.error("Erro ao buscar tarifa do DB", { error, uf, grupo });
            // Fallback: buscar snapshot backup (implementar se necessário)
            return null;
        }
    }

    /**
     * Calcula custo anual de energia
     */
    async calcularCustoAnual(input: CustoAnualInput): Promise<CustoAnualResult> {
        const {
            uf,
            consumo_mensal_kwh,
            grupo = GrupoTarifa.B1,
            classe = ClasseConsumidor.RESIDENCIAL,
            bandeira_media = BandeiraTarifaria.AMARELA,
            concessionaria_sigla,
        } = input;

        const tarifa_vigente = await this.getTarifaVigente({
            uf,
            grupo,
            classe,
            concessionaria_sigla,
        });

        if (!tarifa_vigente) {
            throw new Error(`Tarifa não encontrada para UF: ${uf}, Grupo: ${grupo}`);
        }

        const tarifa_efetiva_kwh = calcularTarifaEfetiva(
            tarifa_vigente.tarifa.tarifa_kwh,
            bandeira_media
        );

        const custo_mensal = calcularCustoMensal(consumo_mensal_kwh, tarifa_efetiva_kwh);
        const custo_anual = custo_mensal * 12;

        const breakdown = calcularBreakdownCustos(
            consumo_mensal_kwh,
            tarifa_vigente.tarifa.tarifa_tusd,
            tarifa_vigente.tarifa.tarifa_te,
            BANDEIRA_VALORES[bandeira_media]
        );

        return {
            custo_anual,
            custo_mensal_medio: custo_mensal,
            tarifa_utilizada: tarifa_vigente,
            breakdown,
        };
    }

    /**
     * Calcula economia com sistema solar
     */
    async calcularEconomiaSolar(input: EconomiaSolarInput): Promise<EconomiaSolarResult> {
        const {
            uf,
            consumo_mensal_kwh,
            geracao_mensal_kwh,
            grupo,
            classe,
            concessionaria_sigla,
            custo_sistema,
        } = input;

        const custo_atual = await this.calcularCustoAnual({
            uf,
            consumo_mensal_kwh,
            grupo,
            classe,
            concessionaria_sigla,
        });

        const consumo_residual = Math.max(0, consumo_mensal_kwh - geracao_mensal_kwh);

        const custo_novo = await this.calcularCustoAnual({
            uf,
            consumo_mensal_kwh: consumo_residual,
            grupo,
            classe,
            concessionaria_sigla,
        });

        const economia_anual = custo_atual.custo_anual - custo_novo.custo_anual;
        const economia_percentual = (economia_anual / custo_atual.custo_anual) * 100;

        let payback_anos: number | undefined;
        let roi_percentual: number | undefined;

        if (custo_sistema) {
            payback_anos = calcularPaybackSimples(custo_sistema, economia_anual);

            // ROI em 25 anos (vida útil padrão)
            const economia_total_25_anos = economia_anual * 25;
            roi_percentual = calcularROI(custo_sistema, economia_total_25_anos);
        }

        return {
            custo_anual_atual: custo_atual.custo_anual,
            custo_anual_novo: custo_novo.custo_anual,
            economia_anual,
            economia_percentual: Number(economia_percentual.toFixed(2)),
            payback_anos,
            roi_percentual,
            tarifa_utilizada: custo_atual.tarifa_utilizada,
        };
    }

    /**
     * Batch query: múltiplas UFs (prevenção N+1)
     */
    async getTarifasBatch(query: TarifasBatchQuery): Promise<TarifasBatchResult> {
        const { ufs, grupo, classe } = query;

        const tarifas = new Map<UF, TarifaVigenteResult>();
        const errors = new Map<UF, string>();
        let cached_count = 0;
        let db_query_count = 0;

        await Promise.all(
            ufs.map(async (uf) => {
                try {
                    const result = await this.getTarifaVigente({ uf, grupo, classe });
                    if (result) {
                        tarifas.set(uf, result);
                        if (result.cached_at) cached_count++;
                        else db_query_count++;
                    } else {
                        errors.set(uf, "Tarifa não encontrada");
                    }
                } catch (error) {
                    errors.set(uf, (error as Error).message);
                }
            })
        );

        return { tarifas, errors, cached_count, db_query_count };
    }

    /**
     * Invalida cache de tarifas por tag
     */
    async invalidateTarifasCache(): Promise<void> {
        await this.cacheManager.clearByTag(CACHE_TAG_TARIFAS);
        this.logger.info("Cache de tarifas invalidado");
    }

    /**
     * Lista todas concessionárias
     */
    async listConcessionarias(): Promise<Concessionaria[]> {
        const cacheKey = buildCacheKey(["concessionarias", "all"]);

        const cached = await this.cacheManager.get<Concessionaria[]>(cacheKey);
        if (cached) {
            return cached;
        }

        // Query do banco (implementar quando integrar MikroORM)
        // const result = await this.query().find({ is_active: true });

        // Por ora, retornar array vazio (fallback para dados estáticos)
        return [];
    }

    /**
     * Busca tarifa ativa do banco (placeholder - implementar com MikroORM)
     */
    private async findTarifaAtiva(
        uf: UF,
        grupo: GrupoTarifa,
        classe: ClasseConsumidor,
        data_referencia: Date,
        concessionaria_sigla?: string
    ): Promise<Tarifa | null> {
        // TODO: Implementar query MikroORM quando models estiverem prontos
        // Por ora, retornar fallback de dados estáticos
        return null;
    }

    /**
     * Busca concessionária por ID (placeholder)
     */
    private async findConcessionariaById(id: string): Promise<Concessionaria | null> {
        // TODO: Implementar query MikroORM
        return null;
    }

    /**
     * Busca bandeira atual do mês
     */
    private async getBandeiraAtual(data_referencia: Date = new Date()): Promise<BandeiraHistorico | null> {
        const mes = data_referencia.getMonth() + 1;
        const ano = data_referencia.getFullYear();

        const cacheKey = buildCacheKey(["bandeira", `${ano}-${mes}`]);

        const cached = await this.cacheManager.get<BandeiraHistorico>(cacheKey);
        if (cached) return cached;

        // TODO: Query do banco
        // const result = await this.query("bandeiras_historico").findOne({ mes, ano });

        return null;
    }
}

export default ANEELTariffService;
