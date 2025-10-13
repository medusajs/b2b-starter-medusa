/**
 * PRODIST Validator
 * Valida conformidade com PRODIST Módulo 3 (Acesso ao Sistema de Distribuição)
 */

import { ComplianceInput, ProdistValidation, ClasseTarifaria } from '../types'

/**
 * Limites por classe tarifária conforme PRODIST
 */
const LIMITES_POR_CLASSE: Record<ClasseTarifaria, {
    tensao_min_kv: number
    tensao_max_kv: number
    potencia_max_micro_kwp: number
    potencia_max_mini_kwp: number
}> = {
    'B1': { tensao_min_kv: 0.11, tensao_max_kv: 0.44, potencia_max_micro_kwp: 75, potencia_max_mini_kwp: 5000 },
    'B2': { tensao_min_kv: 0.11, tensao_max_kv: 0.44, potencia_max_micro_kwp: 75, potencia_max_mini_kwp: 5000 },
    'B3': { tensao_min_kv: 0.11, tensao_max_kv: 0.44, potencia_max_micro_kwp: 75, potencia_max_mini_kwp: 5000 },
    'A4': { tensao_min_kv: 2.3, tensao_max_kv: 25, potencia_max_micro_kwp: 75, potencia_max_mini_kwp: 5000 },
    'A3': { tensao_min_kv: 30, tensao_max_kv: 44, potencia_max_micro_kwp: 0, potencia_max_mini_kwp: 5000 },
    'A3a': { tensao_min_kv: 30, tensao_max_kv: 44, potencia_max_micro_kwp: 0, potencia_max_mini_kwp: 5000 },
    'A2': { tensao_min_kv: 88, tensao_max_kv: 138, potencia_max_micro_kwp: 0, potencia_max_mini_kwp: 5000 },
    'A1': { tensao_min_kv: 230, tensao_max_kv: 999, potencia_max_micro_kwp: 0, potencia_max_mini_kwp: 5000 },
}

/**
 * Oversizing permitido conforme REN 1.059/2023
 * - Até 31/12/2028: 145% (sistemas novos)
 * - Após 2028: 100% (sem oversizing)
 * - Sistemas antes de 2023: 160% (direito adquirido)
 */
const OVERSIZING_MAXIMO_PERCENT = 145 // Regra atual (2025)

export function validateProdist(input: ComplianceInput): ProdistValidation {
    const limites = LIMITES_POR_CLASSE[input.classe_tarifaria]
    const warnings: string[] = []
    const errors: string[] = []

    // 1. Validar Nível de Tensão
    const tensao_kv = input.tensao_conexao_kv
    const nivel_tensao_correto = tensao_kv >= limites.tensao_min_kv && tensao_kv <= limites.tensao_max_kv

    if (!nivel_tensao_correto) {
        errors.push(
            `Tensão de conexão ${tensao_kv} kV incompatível com classe ${input.classe_tarifaria}. ` +
            `Faixa permitida: ${limites.tensao_min_kv} - ${limites.tensao_max_kv} kV.`
        )
    }

    // 2. Validar Potência (Micro vs Mini)
    const potencia_kwp = input.potencia_instalada_kwp
    let potencia_dentro_limites = true
    let categoria_geracao: 'microgeracao' | 'minigeracao' | 'invalido' = 'microgeracao'

    if (potencia_kwp <= limites.potencia_max_micro_kwp) {
        categoria_geracao = 'microgeracao'
    } else if (potencia_kwp > limites.potencia_max_micro_kwp && potencia_kwp <= limites.potencia_max_mini_kwp) {
        categoria_geracao = 'minigeracao'
        warnings.push(
            `Sistema enquadrado como MINIGERAÇÃO (${potencia_kwp} kWp > 75 kWp). ` +
            `Requer projeto elétrico completo e processo de homologação mais rigoroso.`
        )
    } else {
        categoria_geracao = 'invalido'
        potencia_dentro_limites = false
        errors.push(
            `Potência ${potencia_kwp} kWp excede limite de ${limites.potencia_max_mini_kwp} kWp ` +
            `para minigeração distribuída.`
        )
    }

    // 3. Validar Oversizing
    const geracao_estimada_kwh_ano = potencia_kwp * 1500 // Aproximação: 1500 kWh/kWp/ano
    const consumo_kwh_ano = input.consumo_anual_kwh
    const oversizing_percent = (geracao_estimada_kwh_ano / consumo_kwh_ano) * 100
    const oversizing_valido = oversizing_percent <= OVERSIZING_MAXIMO_PERCENT

    if (!oversizing_valido) {
        errors.push(
            `Oversizing de ${oversizing_percent.toFixed(1)}% excede limite de ${OVERSIZING_MAXIMO_PERCENT}% ` +
            `(REN 1.059/2023). Sistema gerará ${geracao_estimada_kwh_ano.toLocaleString('pt-BR')} kWh/ano ` +
            `contra consumo de ${consumo_kwh_ano.toLocaleString('pt-BR')} kWh/ano.`
        )
    } else if (oversizing_percent > 120) {
        warnings.push(
            `Oversizing de ${oversizing_percent.toFixed(1)}% está próximo ao limite. ` +
            `Considere redimensionar para evitar problemas na homologação.`
        )
    }

    // 4. Validar Modalidade MMGD
    let modalidade_permitida = true

    // Microgeração: todas as modalidades permitidas
    // Minigeração: geralmente "junto à carga" ou "autoconsumo remoto"
    if (categoria_geracao === 'minigeracao') {
        const modalidades_permitidas_mini = [
            'minigeracao_junto_a_carga',
            'autoconsumo_remoto',
            'geracao_compartilhada'
        ]

        if (!modalidades_permitidas_mini.includes(input.modalidade_mmgd)) {
            modalidade_permitida = false
            errors.push(
                `Modalidade "${input.modalidade_mmgd}" não permitida para minigeração. ` +
                `Use: minigeracao_junto_a_carga, autoconsumo_remoto ou geracao_compartilhada.`
            )
        }
    }

    // Validações específicas de modalidade
    if (input.modalidade_mmgd === 'geracao_compartilhada') {
        warnings.push(
            'Geração compartilhada requer cadastro de todas as unidades consumidoras participantes ' +
            'e definição de percentuais de rateio antes da homologação.'
        )
    }

    if (input.modalidade_mmgd.includes('autoconsumo_remoto')) {
        warnings.push(
            'Autoconsumo remoto requer que geração e consumo estejam na mesma área de concessão ' +
            'e sob titularidade do mesmo CPF/CNPJ.'
        )
    }

    // 5. Validações Adicionais por Distribuidora
    if (input.distribuidora) {
        // Placeholder: validações específicas por distribuidora
        // Ex: CEMIG exige documentos adicionais, CPFL tem prazos diferentes, etc.
    }

    // 6. Tipo de Conexão
    if (input.tipo_conexao === 'monofasico' && potencia_kwp > 10) {
        warnings.push(
            'Sistemas acima de 10 kWp geralmente requerem conexão bifásica ou trifásica. ' +
            'Verifique padrão de entrada com a distribuidora.'
        )
    }

    // Resultado Final
    const is_compliant = errors.length === 0

    return {
        conforme: is_compliant,
        scoreGeral: is_compliant ? 100 : Math.max(0, 100 - (errors.length * 20)),
        validacoes: {
            tensao: {
                conforme: nivel_tensao_correto,
                categoria: 'baixa_tensao' as const,
                tensaoNominal: 220,
                tensaoOperacao: 220,
                limites: {},
                faixaOperacao: 'adequada' as const,
                score: nivel_tensao_correto ? 100 : 0,
                naoConformidades: [],
                recomendacoes: []
            },
            frequencia: {
                conforme: true,
                frequenciaOperacao: 60,
                limites: {},
                faixaOperacao: 'normal' as const,
                tempoDesconexao: '0.2s',
                score: 100,
                naoConformidades: [],
                recomendacoes: []
            },
            thd: {
                conforme: true,
                categoria: 'baixa_tensao' as const,
                thdMedido: 0,
                thdLimite: 5,
                percentualLimite: 5,
                score: 100,
                naoConformidades: [],
                recomendacoes: [],
                harmonicasIndividuais: {}
            },
            fatorPotencia: {
                conforme: true,
                fatorPotenciaMedido: 0.92,
                fatorPotenciaMinimo: 0.92,
                score: 100,
                naoConformidades: [],
                recomendacoes: []
            },
            protecoes: {
                conforme: true,
                categoria: 'microgeracao_bt' as const,
                protecoesNecessarias: [],
                protecoesInstaladas: [],
                protecoesFaltantes: [],
                protecoesIncorretas: [],
                score: 100,
                naoConformidades: [],
                recomendacoes: []
            },
            desequilibrio: {},
            aterramento: {}
        },
        naoConformidades: errors,
        recomendacoes: warnings,
        timestamp: new Date().toISOString(),
        // Compatibilidade com versão anterior (deprecated)
        is_compliant,
        nivel_tensao_correto,
        potencia_dentro_limites,
        oversizing_valido,
        modalidade_permitida,
        warnings,
        errors,
        limites: {
            potencia_maxima_kwp: categoria_geracao === 'microgeracao'
                ? limites.potencia_max_micro_kwp
                : limites.potencia_max_mini_kwp,
            oversizing_maximo_percent: OVERSIZING_MAXIMO_PERCENT,
            tensao_minima_kv: limites.tensao_min_kv,
            tensao_maxima_kv: limites.tensao_max_kv,
        }
    }
}

/**
 * Helper: Detectar categoria de geração
 */
export function detectarCategoriaGeracao(potencia_kwp: number): 'microgeracao' | 'minigeracao' {
    return potencia_kwp <= 75 ? 'microgeracao' : 'minigeracao'
}

/**
 * Helper: Calcular oversizing atual
 */
export function calcularOversizing(
    potencia_kwp: number,
    consumo_anual_kwh: number
): number {
    const geracao_estimada = potencia_kwp * 1500 // Aproximação média nacional
    return (geracao_estimada / consumo_anual_kwh) * 100
}

/**
 * Helper: Recomendar ajuste de potência
 */
export function recomendarPotencia(
    consumo_anual_kwh: number,
    oversizing_desejado_percent: number = 120
): number {
    // Potência = (Consumo * Oversizing) / HSP médio anual
    const hsp_medio_anual = 1500 // kWh/kWp/ano (aproximação)
    return (consumo_anual_kwh * (oversizing_desejado_percent / 100)) / hsp_medio_anual
}
