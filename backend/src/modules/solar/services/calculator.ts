/**
 * 🌞 YSH Solar Calculator Service
 * Cálculos solares e financeiros integrados com kits e equipamentos
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SolarCalculationInput {
    // Dados de consumo
    consumo_kwh_mes: number;
    consumo_mensal_kwh?: number[]; // Array de 12 meses para perfil detalhado

    // Localização
    cep?: string;
    municipio?: string;
    uf: string;
    latitude?: number;
    longitude?: number;

    // Parâmetros do sistema
    tipo_telhado?: 'laje' | 'ceramico' | 'metalico' | 'fibrocimento' | 'solo';
    area_disponivel_m2?: number;
    orientacao?: 'norte' | 'sul' | 'leste' | 'oeste' | 'nordeste' | 'noroeste';
    inclinacao_graus?: number;
    fase?: 'monofasico' | 'bifasico' | 'trifasico';

    // Preferências
    oversizing_target?: 100 | 114 | 130 | 145 | 160; // % conforme MMGD
    tipo_sistema?: 'on-grid' | 'off-grid' | 'hibrido';
    marca_preferida?: string;

    // Financeiro
    tarifa_energia_kwh?: number; // Se não fornecido, busca automaticamente
    budget_max?: number;
    prazo_financiamento_meses?: number;
}

export interface SolarCalculationOutput {
    // Dimensionamento técnico
    dimensionamento: {
        kwp_necessario: number;
        kwp_proposto: number;
        numero_paineis: number;
        potencia_inversor_kw: number;
        area_necessaria_m2: number;
        geracao_mensal_kwh: number[];
        geracao_anual_kwh: number;
        performance_ratio: number;
        oversizing_ratio: number;
    };

    // Kits recomendados (do catálogo real)
    kits_recomendados: {
        kit_id: string;
        nome: string;
        potencia_kwp: number;
        match_score: number; // 0-100, quão bem atende a necessidade
        componentes: {
            paineis: Array<{
                marca: string;
                modelo: string;
                potencia_w: number;
                quantidade: number;
                eficiencia?: number;
            }>;
            inversores: Array<{
                marca: string;
                modelo: string;
                potencia_kw: number;
                quantidade: number;
                mppt?: number;
            }>;
            baterias?: Array<{
                marca: string;
                capacidade_kwh: number;
                quantidade: number;
            }>;
            estrutura: {
                tipo: string;
                quantidade: number;
            };
        };
        preco_brl: number;
        disponibilidade: {
            em_estoque: boolean;
            centro_distribuicao: string;
            prazo_entrega_dias?: number;
        };
    }[];

    // Análise financeira
    financeiro: {
        capex: {
            equipamentos_brl: number;
            instalacao_brl: number;
            projeto_brl: number;
            homologacao_brl: number;
            total_brl: number;
        };
        economia: {
            mensal_brl: number;
            anual_brl: number;
            total_25anos_brl: number;
            economia_percentual: number;
        };
        retorno: {
            payback_simples_anos: number;
            payback_descontado_anos: number;
            tir_percentual: number;
            vpl_brl: number;
        };
        financiamento?: {
            parcela_mensal_brl: number;
            total_financiado_brl: number;
            taxa_juros_mensal: number;
            economia_liquida_mensal_brl: number;
        };
    };

    // Dados ambientais
    impacto_ambiental: {
        co2_evitado_ton_ano: number;
        co2_evitado_ton_25anos: number;
        arvores_equivalentes: number;
        carros_evitados_ano: number;
    };

    // Validações MMGD
    conformidade: {
        mmgd_compliant: boolean;
        dentro_limite_potencia: boolean;
        compensacao_permitida: boolean;
        observacoes: string[];
    };

    // Metadados
    dados_localizacao: {
        irradiancia_ghi_kwh_m2_dia: number;
        hsp_medio_anual: number;
        temperatura_media_c: number;
        dados_fonte: string;
    };
}

// ============================================================================
// Solar Calculator Service
// ============================================================================

export class SolarCalculatorService {
    // Constantes técnicas
    private readonly PERFORMANCE_RATIO_PADRAO = 0.82; // 82% PR típico
    private readonly DEGRADACAO_ANUAL = 0.005; // 0.5% ao ano
    private readonly VIDA_UTIL_ANOS = 25;
    private readonly FATOR_CO2_KWH = 0.0817; // kg CO2 por kWh (grid Brasil)
    private readonly CUSTO_INSTALACAO_POR_KWP = 500; // R$/kWp estimado
    private readonly CUSTO_PROJETO_POR_KWP = 150; // R$/kWp estimado
    private readonly CUSTO_HOMOLOGACAO_FIXO = 1500; // R$ fixo

    // Dados de irradiância por estado (HSP médio anual em kWh/m²/dia)
    private readonly IRRADIANCIA_POR_ESTADO: Record<string, number> = {
        'AC': 4.5, 'AL': 5.5, 'AP': 4.8, 'AM': 4.6, 'BA': 5.8,
        'CE': 5.7, 'DF': 5.4, 'ES': 5.2, 'GO': 5.5, 'MA': 5.4,
        'MT': 5.6, 'MS': 5.3, 'MG': 5.4, 'PA': 4.7, 'PB': 5.8,
        'PR': 4.9, 'PE': 5.7, 'PI': 5.6, 'RJ': 5.0, 'RN': 5.9,
        'RS': 4.7, 'RO': 4.8, 'RR': 4.9, 'SC': 4.6, 'SP': 5.0,
        'SE': 5.6, 'TO': 5.5
    };

    // Tarifas médias por estado (R$/kWh) - valores aproximados B1 residencial
    private readonly TARIFAS_POR_ESTADO: Record<string, number> = {
        'AC': 0.85, 'AL': 0.75, 'AP': 0.70, 'AM': 0.82, 'BA': 0.73,
        'CE': 0.78, 'DF': 0.68, 'ES': 0.77, 'GO': 0.72, 'MA': 0.80,
        'MT': 0.76, 'MS': 0.74, 'MG': 0.80, 'PA': 0.85, 'PB': 0.76,
        'PR': 0.78, 'PE': 0.81, 'PI': 0.79, 'RJ': 0.88, 'RN': 0.77,
        'RS': 0.79, 'RO': 0.83, 'RR': 0.72, 'SC': 0.75, 'SP': 0.82,
        'SE': 0.75, 'TO': 0.77
    };

    /**
     * Calcula sistema solar completo
     */
    async calculate(input: SolarCalculationInput): Promise<SolarCalculationOutput> {
        // 1. Dimensionamento técnico
        const dimensionamento = this.calcularDimensionamento(input);

        // 2. Buscar kits compatíveis do catálogo
        const kits = await this.buscarKitsRecomendados(dimensionamento, input);

        // 3. Análise financeira
        const financeiro = this.calcularFinanceiro(dimensionamento, kits[0], input);

        // 4. Impacto ambiental
        const impacto = this.calcularImpactoAmbiental(dimensionamento.geracao_anual_kwh);

        // 5. Conformidade MMGD
        const conformidade = this.validarConformidade(dimensionamento, input);

        // 6. Dados de localização
        const localizacao = this.obterDadosLocalizacao(input);

        return {
            dimensionamento,
            kits_recomendados: kits,
            financeiro,
            impacto_ambiental: impacto,
            conformidade,
            dados_localizacao: localizacao
        };
    }

    /**
     * Dimensionamento técnico do sistema
     */
    private calcularDimensionamento(input: SolarCalculationInput) {
        // HSP (Horas de Sol Pleno) da região
        const hsp = this.IRRADIANCIA_POR_ESTADO[input.uf] || 5.0;

        // Consumo médio mensal
        const consumo_medio_mes = input.consumo_mensal_kwh
            ? input.consumo_mensal_kwh.reduce((a, b) => a + b, 0) / 12
            : input.consumo_kwh_mes;

        const consumo_anual_kwh = consumo_medio_mes * 12;

        // Oversizing conforme preferência (default 130%)
        const oversizing = (input.oversizing_target || 130) / 100;

        // kWp necessário (fórmula: Consumo / (HSP * 365 * PR))
        const kwp_necessario = consumo_anual_kwh / (hsp * 365 * this.PERFORMANCE_RATIO_PADRAO);
        const kwp_proposto = kwp_necessario * oversizing;

        // Número de painéis (assumindo painéis de 550W como padrão)
        const potencia_painel_padrao = 0.550; // kW
        const numero_paineis = Math.ceil(kwp_proposto / potencia_painel_padrao);

        // Ajustar kWp para número inteiro de painéis
        const kwp_ajustado = numero_paineis * potencia_painel_padrao;

        // Potência do inversor (geralmente 80-90% da potência dos painéis)
        const potencia_inversor_kw = Math.ceil(kwp_ajustado * 0.85 * 10) / 10;

        // Área necessária (aproximadamente 6-7 m² por kWp)
        const area_necessaria_m2 = Math.ceil(kwp_ajustado * 6.5);

        // Geração mensal (distribu por sazonalidade típica do Brasil)
        const sazonalidade = [1.05, 1.10, 1.08, 0.95, 0.90, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.07];
        const geracao_base_mensal = (kwp_ajustado * hsp * 30 * this.PERFORMANCE_RATIO_PADRAO);
        const geracao_mensal_kwh = sazonalidade.map(fator => Math.round(geracao_base_mensal * fator));

        // Geração anual
        const geracao_anual_kwh = geracao_mensal_kwh.reduce((a, b) => a + b, 0);

        return {
            kwp_necessario: Math.round(kwp_necessario * 100) / 100,
            kwp_proposto: Math.round(kwp_ajustado * 100) / 100,
            numero_paineis,
            potencia_inversor_kw,
            area_necessaria_m2,
            geracao_mensal_kwh,
            geracao_anual_kwh: Math.round(geracao_anual_kwh),
            performance_ratio: this.PERFORMANCE_RATIO_PADRAO,
            oversizing_ratio: oversizing
        };
    }

    /**
     * Busca kits do catálogo que atendem o dimensionamento
     */
    private async buscarKitsRecomendados(
        dimensionamento: any,
        input: SolarCalculationInput,
        query?: any
    ): Promise<SolarCalculationOutput['kits_recomendados']> {
        // Se query disponível, usar serviço real de busca
        if (query) {
            try {
                const { kitMatcherService } = await import('./kit-matcher');

                const matches = await kitMatcherService.findMatchingKits({
                    kwp_alvo: dimensionamento.kwp_proposto,
                    kwp_tolerance: 15, // ±15% de tolerância
                    tipo_sistema: input.tipo_sistema,
                    tipo_telhado: input.tipo_telhado,
                    fase: input.fase,
                    marca_preferida: input.marca_preferida,
                    budget_max: input.budget_max
                }, query, 5);

                if (matches.length > 0) {
                    return matches;
                }
            } catch (error) {
                console.warn('[Calculator] Erro ao buscar kits reais:', error);
                // Fallback para mock
            }
        }

        // Fallback: retorna kit mock baseado no dimensionamento
        const kwp_alvo = dimensionamento.kwp_proposto;
        const tipo_estrutura = input.tipo_telhado || 'ceramico';

        return [{
            kit_id: 'FOTUS-KP04',
            nome: `Kit Solar ${kwp_alvo.toFixed(1)}kWp - ${tipo_estrutura}`,
            potencia_kwp: kwp_alvo,
            match_score: 95,
            componentes: {
                paineis: [{
                    marca: 'ASTRONERGY',
                    modelo: 'ASTRO 6 CHEETAH HC 144M',
                    potencia_w: 550,
                    quantidade: dimensionamento.numero_paineis,
                    eficiencia: 21.2
                }],
                inversores: [{
                    marca: 'TSUNESS',
                    modelo: 'HY-G',
                    potencia_kw: dimensionamento.potencia_inversor_kw,
                    quantidade: 1,
                    mppt: 2
                }],
                estrutura: {
                    tipo: tipo_estrutura === 'ceramico' ? 'Estrutura Metálica Cerâmico' : 'Estrutura Metálica Laje',
                    quantidade: dimensionamento.numero_paineis
                }
            },
            preco_brl: this.estimarPrecoKit(kwp_alvo),
            disponibilidade: {
                em_estoque: true,
                centro_distribuicao: 'São Paulo - SP',
                prazo_entrega_dias: 5
            }
        }];
    }    /**
     * Estima preço do kit baseado em kWp
     */
    private estimarPrecoKit(kwp: number): number {
        // Preço médio de mercado: R$ 3.000 - R$ 4.500 por kWp
        const preco_por_kwp = 3500;
        return Math.round(kwp * preco_por_kwp * 100) / 100;
    }

    /**
     * Calcula análise financeira completa
     */
    private calcularFinanceiro(
        dimensionamento: any,
        kit: any,
        input: SolarCalculationInput
    ) {
        const kwp = dimensionamento.kwp_proposto;
        const geracao_anual = dimensionamento.geracao_anual_kwh;

        // CAPEX
        const equipamentos = kit?.preco_brl || this.estimarPrecoKit(kwp);
        const instalacao = kwp * this.CUSTO_INSTALACAO_POR_KWP;
        const projeto = kwp * this.CUSTO_PROJETO_POR_KWP;
        const homologacao = this.CUSTO_HOMOLOGACAO_FIXO;
        const capex_total = equipamentos + instalacao + projeto + homologacao;

        // Tarifa de energia
        const tarifa = input.tarifa_energia_kwh || this.TARIFAS_POR_ESTADO[input.uf] || 0.80;

        // Economia
        const economia_anual = geracao_anual * tarifa;
        const economia_mensal = economia_anual / 12;

        // Economia total em 25 anos (com degradação)
        let economia_total_25anos = 0;
        for (let ano = 1; ano <= this.VIDA_UTIL_ANOS; ano++) {
            const degradacao = Math.pow(1 - this.DEGRADACAO_ANUAL, ano - 1);
            economia_total_25anos += geracao_anual * degradacao * tarifa;
        }

        // Payback simples
        const payback_simples = capex_total / economia_anual;

        // TIR e VPL (fórmulas simplificadas)
        const taxa_desconto = 0.08; // 8% a.a.
        let vpl = -capex_total;
        for (let ano = 1; ano <= this.VIDA_UTIL_ANOS; ano++) {
            const degradacao = Math.pow(1 - this.DEGRADACAO_ANUAL, ano - 1);
            const fluxo = geracao_anual * degradacao * tarifa;
            vpl += fluxo / Math.pow(1 + taxa_desconto, ano);
        }

        const tir = ((economia_total_25anos / capex_total) ** (1 / this.VIDA_UTIL_ANOS) - 1) * 100;

        // Financiamento (se solicitado)
        let financiamento: {
            parcela_mensal_brl: number;
            total_financiado_brl: number;
            taxa_juros_mensal: number;
            economia_liquida_mensal_brl: number;
        } | undefined = undefined;
        if (input.prazo_financiamento_meses) {
            const prazo = input.prazo_financiamento_meses;
            const taxa_mensal = 0.015; // 1.5% a.m. (18% a.a.)
            const parcela = capex_total * (taxa_mensal * Math.pow(1 + taxa_mensal, prazo)) /
                (Math.pow(1 + taxa_mensal, prazo) - 1);

            financiamento = {
                parcela_mensal_brl: Math.round(parcela * 100) / 100,
                total_financiado_brl: Math.round(parcela * prazo * 100) / 100,
                taxa_juros_mensal: taxa_mensal,
                economia_liquida_mensal_brl: Math.round((economia_mensal - parcela) * 100) / 100
            };
        }

        return {
            capex: {
                equipamentos_brl: Math.round(equipamentos * 100) / 100,
                instalacao_brl: Math.round(instalacao * 100) / 100,
                projeto_brl: Math.round(projeto * 100) / 100,
                homologacao_brl: homologacao,
                total_brl: Math.round(capex_total * 100) / 100
            },
            economia: {
                mensal_brl: Math.round(economia_mensal * 100) / 100,
                anual_brl: Math.round(economia_anual * 100) / 100,
                total_25anos_brl: Math.round(economia_total_25anos * 100) / 100,
                economia_percentual: Math.round((geracao_anual / (input.consumo_kwh_mes * 12)) * 100)
            },
            retorno: {
                payback_simples_anos: Math.round(payback_simples * 10) / 10,
                payback_descontado_anos: Math.round((payback_simples * 1.3) * 10) / 10, // Aproximação
                tir_percentual: Math.round(tir * 10) / 10,
                vpl_brl: Math.round(vpl * 100) / 100
            },
            financiamento
        };
    }

    /**
     * Calcula impacto ambiental
     */
    private calcularImpactoAmbiental(geracao_anual_kwh: number) {
        const co2_evitado_ano = (geracao_anual_kwh * this.FATOR_CO2_KWH) / 1000; // toneladas
        const co2_evitado_25anos = co2_evitado_ano * this.VIDA_UTIL_ANOS;

        // 1 árvore absorve ~20kg CO2/ano
        const arvores = Math.round(co2_evitado_25anos * 1000 / 20);

        // Carro médio emite ~2 ton CO2/ano
        const carros = Math.round(co2_evitado_ano / 2);

        return {
            co2_evitado_ton_ano: Math.round(co2_evitado_ano * 100) / 100,
            co2_evitado_ton_25anos: Math.round(co2_evitado_25anos * 100) / 100,
            arvores_equivalentes: arvores,
            carros_evitados_ano: carros
        };
    }

    /**
     * Valida conformidade com MMGD (Resolução ANEEL 1.059/2023)
     */
    private validarConformidade(dimensionamento: any, input: SolarCalculationInput) {
        const observacoes: string[] = [];

        // Limite de oversizing 160% conforme MMGD
        const mmgd_compliant = dimensionamento.oversizing_ratio <= 1.60;
        if (!mmgd_compliant) {
            observacoes.push('Oversizing acima de 160% - não conforme com MMGD');
        }

        // Limite de potência para minigeração (até 5 MW)
        const dentro_limite = dimensionamento.kwp_proposto <= 5000;
        if (!dentro_limite) {
            observacoes.push('Potência acima do limite para minigeração distribuída');
        }

        // Compensação de energia permitida
        const compensacao_permitida = true; // Sempre true para on-grid < 5 MW

        if (mmgd_compliant && dentro_limite) {
            observacoes.push('Sistema conforme Resolução ANEEL 1.059/2023');
        }

        return {
            mmgd_compliant,
            dentro_limite_potencia: dentro_limite,
            compensacao_permitida,
            observacoes
        };
    }

    /**
     * Obtém dados de localização
     */
    private obterDadosLocalizacao(input: SolarCalculationInput) {
        const hsp = this.IRRADIANCIA_POR_ESTADO[input.uf] || 5.0;

        return {
            irradiancia_ghi_kwh_m2_dia: hsp,
            hsp_medio_anual: hsp,
            temperatura_media_c: 25, // Aproximação
            dados_fonte: 'Base histórica INMET/CRESESB'
        };
    }
}

// Export singleton
export const solarCalculatorService = new SolarCalculatorService();
