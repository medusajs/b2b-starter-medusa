/**
 * 📦 YSH Kit Matcher Service
 * Busca e ranqueia kits do catálogo baseado em requisitos técnicos
 */

import type { RemoteQueryFunction } from "@medusajs/framework/types";

export interface KitMatchCriteria {
    kwp_alvo: number;
    kwp_tolerance: number; // Tolerância em % (ex: 10 = ±10%)
    tipo_sistema?: 'on-grid' | 'off-grid' | 'hibrido';
    tipo_telhado?: string;
    fase?: 'monofasico' | 'bifasico' | 'trifasico';
    marca_preferida?: string;
    budget_max?: number;
    preferencia_marca_painel?: string[];
    preferencia_marca_inversor?: string[];
}

export interface KitMatch {
    product_id: string;
    kit_id: string;
    nome: string;
    potencia_kwp: number;
    match_score: number;
    match_reasons: string[];
    componentes: {
        paineis: Array<{
            marca: string;
            modelo?: string;
            potencia_w: number;
            quantidade: number;
            eficiencia?: number;
        }>;
        inversores: Array<{
            marca: string;
            modelo?: string;
            potencia_kw: number;
            quantidade: number;
            mppt?: number;
            tipo?: string;
        }>;
        baterias?: Array<{
            marca: string;
            modelo?: string;
            capacidade_kwh: number;
            quantidade: number;
        }>;
        estrutura?: {
            tipo: string;
            material?: string;
        };
    };
    preco_brl: number;
    disponibilidade: {
        em_estoque: boolean;
        centro_distribuicao?: string;
        prazo_entrega_dias?: number;
    };
    metadata: any;
}

export class KitMatcherService {
    /**
     * Busca kits do catálogo que atendem os critérios
     */
    async findMatchingKits(
        criteria: KitMatchCriteria,
        query: RemoteQueryFunction,
        limit: number = 5
    ): Promise<KitMatch[]> {
        // Calcular range de potência aceito
        const kwp_min = criteria.kwp_alvo * (1 - criteria.kwp_tolerance / 100);
        const kwp_max = criteria.kwp_alvo * (1 + criteria.kwp_tolerance / 100);

        // Buscar produtos do tipo kit
        const { data: products } = await query.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "description",
                "handle",
                "status",
                "thumbnail",
                "metadata",
                "variants.id",
                "variants.title",
                "variants.sku",
                "variants.prices.amount",
                "variants.prices.currency_code",
            ],
            filters: {
                // Filtrar por metadados de kit
                metadata: {
                    $or: [
                        { potencia_kwp: { $gte: kwp_min, $lte: kwp_max } },
                        { potencia_w: { $gte: kwp_min * 1000, $lte: kwp_max * 1000 } }
                    ]
                }
            },
        });

        if (!products || products.length === 0) {
            return [];
        }

        // Processar e ranquear kits
        const matches: KitMatch[] = [];

        for (const product of products) {
            const metadata = product.metadata || {};

            // Extrair potência
            const potencia_kwp = this.extractPotenciaKwp(metadata);

            if (!potencia_kwp || potencia_kwp < kwp_min || potencia_kwp > kwp_max) {
                continue;
            }

            // Calcular score de match
            const matchResult = this.calculateMatchScore(product, metadata, criteria);

            if (matchResult.score > 0) {
                // Extrair preço
                const preco = this.extractPrice(product);

                // Verificar budget
                if (criteria.budget_max && preco > criteria.budget_max) {
                    continue;
                }

                matches.push({
                    product_id: product.id,
                    kit_id: String(metadata.kit_id || metadata.id || product.handle),
                    nome: product.title,
                    potencia_kwp,
                    match_score: matchResult.score,
                    match_reasons: matchResult.reasons,
                    componentes: this.extractComponentes(metadata),
                    preco_brl: preco,
                    disponibilidade: {
                        em_estoque: metadata.em_estoque !== false,
                        centro_distribuicao: String(metadata.centro_distribuicao || ''),
                        prazo_entrega_dias: Number(metadata.prazo_entrega_dias) || 5
                    },
                    metadata
                });
            }
        }

        // Ordenar por score (maior primeiro)
        matches.sort((a, b) => b.match_score - a.match_score);

        // Retornar top N
        return matches.slice(0, limit);
    }

    /**
     * Calcula score de compatibilidade (0-100)
     */
    private calculateMatchScore(
        product: any,
        metadata: any,
        criteria: KitMatchCriteria
    ): { score: number; reasons: string[] } {
        let score = 0;
        const reasons: string[] = [];
        const maxScore = 100;

        // 1. Potência (40 pontos) - quão próximo do alvo
        const potencia_kwp = this.extractPotenciaKwp(metadata);
        const potencia_diff_pct = Math.abs(potencia_kwp - criteria.kwp_alvo) / criteria.kwp_alvo * 100;
        const potencia_score = Math.max(0, 40 - (potencia_diff_pct * 2));
        score += potencia_score;

        if (potencia_diff_pct < 5) {
            reasons.push('Potência ideal para sua necessidade');
        } else if (potencia_diff_pct < 10) {
            reasons.push('Potência muito próxima do ideal');
        }

        // 2. Tipo de sistema (20 pontos)
        if (criteria.tipo_sistema) {
            const tipo_match = this.matchTipoSistema(metadata, criteria.tipo_sistema);
            if (tipo_match) {
                score += 20;
                reasons.push(`Sistema ${criteria.tipo_sistema} compatível`);
            }
        } else {
            score += 10; // Pontuação parcial se não especificado
        }

        // 3. Tipo de telhado/estrutura (15 pontos)
        if (criteria.tipo_telhado) {
            const estrutura_match = this.matchEstrutura(metadata, criteria.tipo_telhado);
            if (estrutura_match) {
                score += 15;
                reasons.push(`Estrutura para telhado ${criteria.tipo_telhado}`);
            }
        } else {
            score += 7; // Pontuação parcial
        }

        // 4. Marca preferida (10 pontos)
        if (criteria.marca_preferida || criteria.preferencia_marca_painel?.length) {
            const marca_match = this.matchMarca(metadata, criteria);
            if (marca_match) {
                score += 10;
                reasons.push('Marca preferida incluída');
            }
        } else {
            score += 5;
        }

        // 5. Fase elétrica (10 pontos)
        if (criteria.fase) {
            const fase_match = this.matchFase(metadata, criteria.fase);
            if (fase_match) {
                score += 10;
                reasons.push(`Compatível com ${criteria.fase}`);
            }
        } else {
            score += 5;
        }

        // 6. Disponibilidade (5 pontos)
        if (metadata.em_estoque !== false) {
            score += 5;
            reasons.push('Disponível em estoque');
        }

        // Normalizar score para 0-100
        const normalizedScore = Math.min(100, Math.round(score));

        return {
            score: normalizedScore,
            reasons
        };
    }

    /**
     * Extrai potência em kWp do metadata
     */
    private extractPotenciaKwp(metadata: any): number {
        // Tentar diferentes campos
        if (metadata.potencia_kwp) {
            return parseFloat(metadata.potencia_kwp);
        }
        if (metadata.potencia_w) {
            return parseFloat(metadata.potencia_w) / 1000;
        }
        if (metadata.power_kwp) {
            return parseFloat(metadata.power_kwp);
        }

        // Tentar extrair do título/descrição
        // TODO: implementar regex parsing se necessário

        return 0;
    }

    /**
     * Extrai preço do produto
     */
    private extractPrice(product: any): number {
        // Tentar metadata primeiro
        if (product.metadata?.price_brl) {
            return parseFloat(product.metadata.price_brl);
        }

        // Tentar variantes
        if (product.variants && product.variants.length > 0) {
            const variant = product.variants[0];
            if (variant.prices && variant.prices.length > 0) {
                const brlPrice = variant.prices.find((p: any) =>
                    p.currency_code === 'brl' || p.currency_code === 'BRL'
                );
                if (brlPrice) {
                    return parseFloat(brlPrice.amount) / 100; // Converter de centavos
                }
            }
        }

        return 0;
    }

    /**
     * Extrai componentes do kit
     */
    private extractComponentes(metadata: any): KitMatch['componentes'] {
        return {
            paineis: metadata.panels || metadata.paineis || [],
            inversores: metadata.inverters || metadata.inversores || [],
            baterias: metadata.batteries || metadata.baterias || [],
            estrutura: metadata.structure || metadata.estrutura || undefined
        };
    }

    /**
     * Verifica compatibilidade de tipo de sistema
     */
    private matchTipoSistema(metadata: any, tipo: string): boolean {
        const tipo_lower = tipo.toLowerCase();

        // Verificar campos específicos
        if (metadata.tipo_sistema) {
            return metadata.tipo_sistema.toLowerCase().includes(tipo_lower);
        }

        // Verificar tags/categorias
        if (metadata.categories) {
            return metadata.categories.some((c: string) =>
                c.toLowerCase().includes(tipo_lower)
            );
        }

        // Verificar título
        if (metadata.title) {
            const title_lower = metadata.title.toLowerCase();
            if (tipo === 'on-grid' && !title_lower.includes('off') && !title_lower.includes('hibrido')) {
                return true;
            }
            if (tipo === 'off-grid' && title_lower.includes('off')) {
                return true;
            }
            if (tipo === 'hibrido' && title_lower.includes('hibrido')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verifica compatibilidade de estrutura
     */
    private matchEstrutura(metadata: any, tipo_telhado: string): boolean {
        const tipo_lower = tipo_telhado.toLowerCase();

        if (metadata.estrutura) {
            return metadata.estrutura.toLowerCase().includes(tipo_lower);
        }

        if (metadata.tipo_telhado) {
            return metadata.tipo_telhado.toLowerCase().includes(tipo_lower);
        }

        return false;
    }

    /**
     * Verifica marca preferida
     */
    private matchMarca(metadata: any, criteria: KitMatchCriteria): boolean {
        const componentes = this.extractComponentes(metadata);

        // Verificar marca geral
        if (criteria.marca_preferida) {
            const marca_lower = criteria.marca_preferida.toLowerCase();

            // Verificar painéis
            const painelMatch = componentes.paineis?.some(p =>
                p.marca?.toLowerCase().includes(marca_lower)
            );
            if (painelMatch) return true;

            // Verificar inversores
            const inversorMatch = componentes.inversores?.some(i =>
                i.marca?.toLowerCase().includes(marca_lower)
            );
            if (inversorMatch) return true;
        }

        // Verificar preferências específicas
        if (criteria.preferencia_marca_painel?.length) {
            const painelMatch = componentes.paineis?.some(p =>
                criteria.preferencia_marca_painel!.some(marca =>
                    p.marca?.toLowerCase().includes(marca.toLowerCase())
                )
            );
            if (painelMatch) return true;
        }

        if (criteria.preferencia_marca_inversor?.length) {
            const inversorMatch = componentes.inversores?.some(i =>
                criteria.preferencia_marca_inversor!.some(marca =>
                    i.marca?.toLowerCase().includes(marca.toLowerCase())
                )
            );
            if (inversorMatch) return true;
        }

        return false;
    }

    /**
     * Verifica compatibilidade de fase
     */
    private matchFase(metadata: any, fase: string): boolean {
        const fase_map: Record<string, string[]> = {
            'monofasico': ['mono', '1f', 'monofasico', 'monofásico'],
            'bifasico': ['bi', '2f', 'bifasico', 'bifásico'],
            'trifasico': ['tri', '3f', 'trifasico', 'trifásico']
        };

        const keywords = fase_map[fase] || [];

        // Verificar inversores
        const componentes = this.extractComponentes(metadata);
        if (componentes.inversores?.length > 0) {
            return componentes.inversores.some(inv => {
                const tipo = inv.tipo?.toLowerCase() || '';
                return keywords.some(k => tipo.includes(k));
            });
        }

        return false;
    }
}

// Export singleton
export const kitMatcherService = new KitMatcherService();
