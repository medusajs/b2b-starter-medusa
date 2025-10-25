/**
 * Cotador de Seguros Solar
 * Gera cotações personalizadas por classe de cliente
 */

import { SeguroInput, CotacaoSeguro, ComparacaoSeguros, TipoSeguro, TipoCobertura, CoberturaDetalhes } from '../types'
import { getAllSeguradoras } from '../data/seguradoras'
import { CustomerGroup } from '@/lib/context/sales-channel-context'

/**
 * Taxa base de prêmio por tipo de seguro (% do valor segurado)
 */
const TAXA_BASE: Record<TipoSeguro, number> = {
    'residencial': 0.018, // 1.8% ao ano
    'comercial': 0.022,   // 2.2% ao ano
    'industrial': 0.028,  // 2.8% ao ano
    'rural': 0.025        // 2.5% ao ano (risco intermediário)
}

/**
 * Fator de ajuste por cobertura adicional
 */
const FATOR_COBERTURA: Record<TipoCobertura, number> = {
    'equipamento': 1.0,           // Base
    'performance': 1.15,          // +15%
    'rc': 1.10,                   // +10%
    'perda_producao': 1.20,       // +20%
    'fenomenos_naturais': 1.08,   // +8%
    'transporte': 1.05,           // +5%
    'obras': 1.12                 // +12%
}

/**
 * Mapeia CustomerGroup para TipoSeguro
 */
function getTipoSeguro(customerGroup: CustomerGroup): TipoSeguro {
    switch (customerGroup) {
        case 'residencial-b1':
            return 'residencial'
        case 'rural-b2':
            return 'rural'
        case 'comercial-b3':
        case 'condominios':
        case 'integradores':
            return 'comercial'
        case 'industria':
            return 'industrial'
        default:
            return 'residencial'
    }
}

/**
 * Calcula fator de risco geográfico (simplificado)
 */
function getFatorRiscoGeografico(uf: string): number {
    const RISCO_POR_UF: Record<string, number> = {
        'SP': 1.05, // Alta densidade urbana
        'RJ': 1.08, // Violência urbana
        'MG': 1.02,
        'SC': 0.98,
        'PR': 1.00,
        'RS': 1.03,
        'BA': 1.04,
        'PE': 1.06,
        'CE': 1.05,
        'AM': 1.10, // Difícil acesso
        'PA': 1.08,
        'MT': 1.02,
        'GO': 1.01,
        'DF': 1.03,
    }
    return RISCO_POR_UF[uf] || 1.0
}

/**
 * Calcula desconto por medidas de segurança
 */
function calcularDesconto(input: SeguroInput): { desconto_percent: number; motivos: string[] } {
    let desconto = 0
    const motivos: string[] = []

    if (input.possui_monitoramento) {
        desconto += 5
        motivos.push('Sistema com monitoramento remoto (-5%)')
    }

    if (input.possui_manutencao_preventiva) {
        desconto += 3
        motivos.push('Contrato de manutenção preventiva (-3%)')
    }

    if (input.tipo_instalacao === 'solo') {
        desconto += 2
        motivos.push('Instalação em solo (menor risco estrutural) (-2%)')
    }

    // Desconto por potência (economia de escala)
    if (input.potencia_kwp > 100) {
        desconto += 8
        motivos.push('Sistema acima de 100 kWp (-8%)')
    } else if (input.potencia_kwp > 50) {
        desconto += 5
        motivos.push('Sistema acima de 50 kWp (-5%)')
    }

    return {
        desconto_percent: Math.min(desconto, 20), // Máximo 20% desconto
        motivos
    }
}

/**
 * Gera detalhes das coberturas
 */
function gerarCoberturas(
    input: SeguroInput,
    valorEquipamento: number,
    tipoSeguro: TipoSeguro
): CoberturaDetalhes[] {
    const coberturas: CoberturaDetalhes[] = []

    // Equipamento (obrigatória)
    coberturas.push({
        tipo: 'equipamento',
        incluida: true,
        valor_segurado: valorEquipamento,
        franquia: valorEquipamento * 0.02, // 2% de franquia
        descricao: 'Roubo, furto qualificado, incêndio, raio, explosão, danos elétricos',
        limitações: [
            'Não cobre desgaste natural',
            'Não cobre danos por instalação inadequada',
            'Vistoria prévia obrigatória'
        ]
    })

    // Performance
    if (input.coberturas_desejadas.includes('performance')) {
        const geracaoEstimada = input.potencia_kwp * 1500 * 0.8 // 80% da geração no primeiro ano
        coberturas.push({
            tipo: 'performance',
            incluida: true,
            valor_segurado: geracaoEstimada * 0.5, // 50 centavos/kWh
            franquia: 0,
            descricao: 'Garantia de performance mínima de 80% da geração estimada',
            limitações: [
                'Requer monitoramento certificado',
                'Medição anual da performance',
                'Indenização em créditos ou dinheiro'
            ]
        })
    }

    // RC (Responsabilidade Civil)
    if (input.coberturas_desejadas.includes('rc')) {
        const valorRC = tipoSeguro === 'residencial' ? 50000 : tipoSeguro === 'comercial' ? 200000 : 500000
        coberturas.push({
            tipo: 'rc',
            incluida: true,
            valor_segurado: valorRC,
            franquia: 0,
            descricao: 'Danos a terceiros causados pelo sistema solar',
            limitações: [
                'Cobertura para danos materiais e corporais',
                'Não cobre danos intencionais',
                'Limite por evento'
            ]
        })
    }

    // Perda de Produção
    if (input.coberturas_desejadas.includes('perda_producao')) {
        const lucroAnual = input.potencia_kwp * 1500 * 0.6 // R$ 0.60/kWh economia
        coberturas.push({
            tipo: 'perda_producao',
            incluida: true,
            valor_segurado: lucroAnual,
            franquia: 7, // 7 dias de carência
            descricao: 'Lucros cessantes por interrupção de geração',
            limitações: [
                'Cobertura após 7 dias de parada',
                'Até 180 dias de indenização',
                'Requer comprovação de lucro cessante'
            ]
        })
    }

    // Fenômenos Naturais
    if (input.coberturas_desejadas.includes('fenomenos_naturais')) {
        coberturas.push({
            tipo: 'fenomenos_naturais',
            incluida: true,
            valor_segurado: valorEquipamento,
            franquia: valorEquipamento * 0.05, // 5% de franquia (maior risco)
            descricao: 'Tempestades, furacões, granizo, inundações',
            limitações: [
                'Não cobre regiões de alto risco sem avaliação',
                'Franquia maior devido ao risco',
                'Laudo meteorológico obrigatório'
            ]
        })
    }

    // Transporte
    if (input.coberturas_desejadas.includes('transporte')) {
        coberturas.push({
            tipo: 'transporte',
            incluida: true,
            valor_segurado: valorEquipamento * 0.3, // 30% do valor (equipamentos em trânsito)
            franquia: 500,
            descricao: 'Cobertura durante transporte dos equipamentos até o local de instalação',
            limitações: [
                'Válido apenas para transporte contratado',
                'Embalagem adequada obrigatória',
                'Prazo máximo de 30 dias'
            ]
        })
    }

    // Obras
    if (input.coberturas_desejadas.includes('obras')) {
        coberturas.push({
            tipo: 'obras',
            incluida: true,
            valor_segurado: valorEquipamento * 1.2, // 120% (inclui mão de obra)
            franquia: valorEquipamento * 0.03,
            descricao: 'Cobertura durante instalação e comissionamento',
            limitações: [
                'Instalador certificado obrigatório',
                'Prazo máximo de 90 dias',
                'ART/RRT obrigatória'
            ]
        })
    }

    return coberturas
}

/**
 * Gera cotação para uma seguradora específica
 */
function gerarCotacao(
    input: SeguroInput,
    seguradoraCodigo: string,
    tipoSeguro: TipoSeguro
): CotacaoSeguro {
    const seguradora = getAllSeguradoras().find(s => s.codigo === seguradoraCodigo)
    if (!seguradora) throw new Error(`Seguradora ${seguradoraCodigo} não encontrada`)

    // Cálculo do prêmio base
    const taxaBase = TAXA_BASE[tipoSeguro]
    const fatorGeografico = getFatorRiscoGeografico(input.uf)

    // Fator de cobertura (multiplica por cada cobertura adicional)
    let fatorCobertura = 1.0
    input.coberturas_desejadas.forEach(cob => {
        fatorCobertura *= FATOR_COBERTURA[cob]
    })

    // Prêmio bruto
    let premioAnual = input.valor_equipamento * taxaBase * fatorGeografico * fatorCobertura

    // Ajuste por seguradora (rating e eficiência)
    const ajusteSeguradora = 0.9 + (seguradora.nota_rating / 100) // 0.9 a 1.0
    premioAnual *= ajusteSeguradora

    // Desconto
    const { desconto_percent, motivos } = calcularDesconto(input)
    const descontoValor = premioAnual * (desconto_percent / 100)
    premioAnual -= descontoValor

    // Coberturas
    const coberturas = gerarCoberturas(input, input.valor_equipamento, tipoSeguro)
    const valorTotalSegurado = coberturas.reduce((sum, cob) => sum + cob.valor_segurado, 0)

    // Score de recomendação (baseado em rating, preço e tempo de sinistro)
    const scoreRating = seguradora.nota_rating * 10 // 0-100
    const scorePreco = 100 - (premioAnual / input.valor_equipamento) * 100 // Quanto menor o prêmio, melhor
    const scoreSinistro = 100 - (seguradora.tempo_medio_sinistro_dias * 2) // Quanto mais rápido, melhor
    const scoreRecomendacao = (scoreRating * 0.4 + scorePreco * 0.35 + scoreSinistro * 0.25)

    return {
        seguradora,
        tipo_seguro: tipoSeguro,
        premio_anual: Math.round(premioAnual * 100) / 100,
        premio_mensal: Math.round((premioAnual / 12) * 100) / 100,
        forma_pagamento: ['anual', 'semestral', 'mensal'],
        coberturas,
        valor_total_segurado: valorTotalSegurado,
        vigencia_anos: 1,
        renovacao_automatica: true,
        carencia_dias: 15,
        desconto_percent: desconto_percent > 0 ? desconto_percent : undefined,
        motivo_desconto: motivos.length > 0 ? motivos : undefined,
        score_recomendacao: Math.round(scoreRecomendacao)
    }
}

/**
 * Gera comparação completa de seguros
 */
export function cotarSeguros(input: SeguroInput): ComparacaoSeguros {
    const tipoSeguro = getTipoSeguro(input.customer_group)
    const seguradoras = getAllSeguradoras()

    // Gerar cotações para todas as seguradoras
    const cotacoes = seguradoras.map(seg => gerarCotacao(input, seg.codigo, tipoSeguro))

    // Ordenar por score de recomendação
    cotacoes.sort((a, b) => b.score_recomendacao - a.score_recomendacao)

    // Definir destaques
    const maisBarato = cotacoes.reduce((min, cot) => cot.premio_anual < min.premio_anual ? cot : min)
    maisBarato.destaque = 'melhor_preco'

    const maiorCobertura = cotacoes.reduce((max, cot) =>
        cot.valor_total_segurado > max.valor_total_segurado ? cot : max
    )
    if (maiorCobertura !== maisBarato) {
        maiorCobertura.destaque = 'maior_cobertura'
    }

    const maisVendido = cotacoes[0] // Maior score = mais recomendado
    if (maisVendido !== maisBarato && maisVendido !== maiorCobertura) {
        maisVendido.destaque = 'mais_vendido'
    }

    // Economia
    const maisCaro = cotacoes.reduce((max, cot) => cot.premio_anual > max.premio_anual ? cot : max)
    const economiaMaxima = maisCaro.premio_anual - maisBarato.premio_anual

    return {
        input,
        cotacoes,
        recomendacao: cotacoes[0], // Melhor score
        economia_maxima: Math.round(economiaMaxima * 100) / 100
    }
}

/**
 * Calcula prêmio estimado rápido (sem coberturas detalhadas)
 */
export function calcularPremioEstimado(
    valorEquipamento: number,
    customerGroup: CustomerGroup,
    uf: string
): number {
    const tipoSeguro = getTipoSeguro(customerGroup)
    const taxaBase = TAXA_BASE[tipoSeguro]
    const fatorGeografico = getFatorRiscoGeografico(uf)

    return Math.round(valorEquipamento * taxaBase * fatorGeografico * 100) / 100
}
