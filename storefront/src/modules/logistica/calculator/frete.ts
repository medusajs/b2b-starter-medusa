/**
 * Calculadora de Frete
 * Calcula valores e prazos de entrega por transportadora
 */

import { FreteInput, CotacaoFrete, ComparacaoFrete, TipoFrete, ModalFrete } from '../types'
import { getAllTransportadoras, getTransportadorasByCapacidade } from '../data/transportadoras'
import { CustomerGroup } from '@/lib/context/sales-channel-context'

/**
 * Distância aproximada entre capitais (km)
 * Simplificação: usa lookup table para principais rotas
 */
function calcularDistanciaAproximada(uf_origem: string, uf_destino: string): number {
    // Matriz simplificada de distâncias rodoviárias entre capitais (km)
    const DISTANCIAS: Record<string, Record<string, number>> = {
        'SP': { 'SP': 0, 'MG': 600, 'RJ': 450, 'PR': 400, 'SC': 550, 'RS': 1100, 'BA': 1950, 'PE': 2700, 'CE': 3100 },
        'MG': { 'SP': 600, 'MG': 0, 'RJ': 450, 'PR': 1000, 'SC': 1200, 'RS': 1800, 'BA': 1400, 'PE': 2200, 'CE': 2600 },
        'RJ': { 'SP': 450, 'MG': 450, 'RJ': 0, 'PR': 850, 'SC': 1100, 'RS': 1650, 'BA': 1650, 'PE': 2450, 'CE': 2850 },
        'PR': { 'SP': 400, 'MG': 1000, 'RJ': 850, 'PR': 0, 'SC': 300, 'RS': 700, 'BA': 2400, 'PE': 3200, 'CE': 3600 },
        'RS': { 'SP': 1100, 'MG': 1800, 'RJ': 1650, 'PR': 700, 'SC': 450, 'RS': 0, 'BA': 3400, 'PE': 4200, 'CE': 4600 },
        'BA': { 'SP': 1950, 'MG': 1400, 'RJ': 1650, 'PR': 2400, 'SC': 2700, 'RS': 3400, 'BA': 0, 'PE': 800, 'CE': 1200 },
    }

    return DISTANCIAS[uf_origem]?.[uf_destino] || 1000 // Default 1000km
}

/**
 * Calcula valor do frete baseado em peso, volume e distância
 */
function calcularValorFrete(
    peso_kg: number,
    volume_m3: number,
    distancia_km: number,
    tipo_frete: TipoFrete,
    area_rural: boolean,
    customer_group: CustomerGroup
): number {
    // Peso cubado: densidade padrão 300 kg/m³
    const peso_cubado = volume_m3 * 300
    const peso_taxado = Math.max(peso_kg, peso_cubado)

    // Taxa base por tipo de frete (R$/kg)
    const TAXA_BASE: Record<TipoFrete, number> = {
        'pac': 0.15,
        'sedex': 0.30,
        'transportadora': 0.20,
        'fob': 0, // Cliente retira
        'cif': 0.22,
        'dedicado': 0.50,
        'expresso': 0.40
    }

    // Fator distância (multiplicador por km)
    const fator_distancia = 1 + (distancia_km / 1000) * 0.3

    // Valor base
    let valor = peso_taxado * TAXA_BASE[tipo_frete] * fator_distancia

    // Adicional área rural
    if (area_rural) {
        valor *= 1.25 // +25%
    }

    // Desconto por volume (economia de escala)
    if (customer_group === 'integradores') {
        valor *= 0.85 // -15% para integradores
    } else if (customer_group === 'industria') {
        valor *= 0.80 // -20% para indústria
    } else if (peso_kg > 500) {
        valor *= 0.90 // -10% para cargas acima de 500kg
    }

    return Math.round(valor * 100) / 100
}

/**
 * Calcula prazo de entrega baseado em distância e tipo de frete
 */
function calcularPrazoEntrega(
    distancia_km: number,
    tipo_frete: TipoFrete,
    area_rural: boolean,
    tempo_medio_dias: number
): number {
    // Prazo base por tipo
    const PRAZO_BASE: Record<TipoFrete, number> = {
        'pac': Math.ceil(distancia_km / 200), // ~200km/dia
        'sedex': Math.ceil(distancia_km / 500), // ~500km/dia
        'transportadora': Math.ceil(distancia_km / 300),
        'fob': 0, // Imediato
        'cif': Math.ceil(distancia_km / 300),
        'dedicado': Math.ceil(distancia_km / 600),
        'expresso': Math.ceil(distancia_km / 600)
    }

    let prazo = Math.max(PRAZO_BASE[tipo_frete], tempo_medio_dias)

    // Adicional área rural
    if (area_rural) {
        prazo += 2 // +2 dias
    }

    return prazo
}

/**
 * Calcula desconto por características do envio
 */
function calcularDesconto(input: FreteInput): { desconto_percent: number; motivos: string[] } {
    let desconto = 0
    const motivos: string[] = []

    // Desconto por volume
    if (input.peso_kg > 500) {
        desconto += 10
        motivos.push('Volume acima de 500kg (-10%)')
    } else if (input.peso_kg > 200) {
        desconto += 5
        motivos.push('Volume acima de 200kg (-5%)')
    }

    // Desconto por cliente
    if (input.customer_group === 'integradores') {
        desconto += 15
        motivos.push('Cliente integrador (-15%)')
    } else if (input.customer_group === 'industria') {
        desconto += 20
        motivos.push('Cliente industrial (-20%)')
    } else if (input.customer_group === 'condominios') {
        desconto += 8
        motivos.push('Cliente condomínio (-8%)')
    }

    // Desconto por não urgência
    if (input.prazo_maximo_dias && input.prazo_maximo_dias > 10) {
        desconto += 5
        motivos.push('Prazo flexível (-5%)')
    }

    return {
        desconto_percent: Math.min(desconto, 30), // Máximo 30% desconto
        motivos
    }
}

/**
 * Gera cotação para uma transportadora específica
 */
function gerarCotacao(
    input: FreteInput,
    transportadoraCodigo: string,
    tipo_frete: TipoFrete
): CotacaoFrete | null {
    const transportadora = getAllTransportadoras().find(t => t.codigo === transportadoraCodigo)
    if (!transportadora) return null

    // Verificar capacidade
    if (input.peso_kg > transportadora.peso_maximo_kg || input.volume_m3 > transportadora.volume_maximo_m3) {
        return null // Não suporta
    }

    // Verificar área rural
    if (input.area_rural && !transportadora.atende_area_rural) {
        return null
    }

    // Calcular distância
    const distancia_km = calcularDistanciaAproximada(input.uf_origem, input.uf_destino)

    // Calcular valor frete
    const valor_frete = calcularValorFrete(
        input.peso_kg,
        input.volume_m3,
        distancia_km,
        tipo_frete,
        input.area_rural || false,
        input.customer_group
    )

    // Valor seguro (0.3% do valor declarado)
    const valor_seguro = input.seguro_carga ? input.valor_declarado * 0.003 : 0

    // GRIS (Gerenciamento de Risco): 0.1% para valores altos
    const valor_gris = input.valor_declarado > 10000 ? input.valor_declarado * 0.001 : 0

    // Taxa entrega para área rural
    const valor_taxa_entrega = input.area_rural ? 50 : 0

    // Prazo
    const prazo_entrega_dias = calcularPrazoEntrega(
        distancia_km,
        tipo_frete,
        input.area_rural || false,
        transportadora.tempo_medio_entrega_dias
    )

    // Verificar prazo máximo
    if (input.prazo_maximo_dias && prazo_entrega_dias > input.prazo_maximo_dias) {
        return null // Não atende prazo
    }

    // Desconto
    const { desconto_percent, motivos } = calcularDesconto(input)
    const valor_total_bruto = valor_frete + valor_seguro + valor_gris + valor_taxa_entrega
    const valor_desconto = valor_total_bruto * (desconto_percent / 100)
    const valor_total = valor_total_bruto - valor_desconto

    // Data entrega estimada
    const data_hoje = new Date()
    const data_entrega = new Date(data_hoje)
    data_entrega.setDate(data_entrega.getDate() + prazo_entrega_dias)

    // Score de recomendação
    const score_preco = 100 - (valor_total / input.valor_declarado) * 100 // Quanto menor o frete, melhor
    const score_prazo = 100 - (prazo_entrega_dias * 5) // Quanto mais rápido, melhor
    const score_confiabilidade = transportadora.nota_avaliacao * 10
    const score_recomendacao = (score_preco * 0.35 + score_prazo * 0.30 + score_confiabilidade * 0.35)

    return {
        transportadora,
        tipo_frete,
        modal: transportadora.modais[0] as ModalFrete,
        valor_frete: Math.round(valor_frete * 100) / 100,
        valor_seguro: Math.round(valor_seguro * 100) / 100,
        valor_gris: valor_gris > 0 ? Math.round(valor_gris * 100) / 100 : undefined,
        valor_taxa_entrega: valor_taxa_entrega > 0 ? valor_taxa_entrega : undefined,
        valor_total: Math.round(valor_total * 100) / 100,
        prazo_entrega_dias,
        prazo_coleta_dias: tipo_frete === 'fob' ? 0 : 1,
        data_entrega_estimada: data_entrega.toISOString().split('T')[0],
        entrega_agendada: input.agendamento_entrega || false,
        rastreamento_online: true,
        nota_fiscal_obrigatoria: input.valor_declarado > 1000,
        desconto_percent: desconto_percent > 0 ? desconto_percent : undefined,
        motivo_desconto: motivos.length > 0 ? motivos : undefined,
        score_recomendacao: Math.max(0, Math.min(100, Math.round(score_recomendacao)))
    }
}

/**
 * Gera comparação completa de fretes
 */
export function cotarFretes(input: FreteInput): ComparacaoFrete {
    const transportadoras = getTransportadorasByCapacidade(
        input.peso_kg,
        input.volume_m3,
        input.area_rural || false
    )

    const cotacoes: CotacaoFrete[] = []

    // Gerar cotações para cada transportadora
    transportadoras.forEach(transp => {
        // Correios: PAC e SEDEX
        if (transp.codigo === 'CORREIOS') {
            const cotacao_pac = gerarCotacao(input, transp.codigo, 'pac')
            if (cotacao_pac) cotacoes.push(cotacao_pac)

            const cotacao_sedex = gerarCotacao(input, transp.codigo, 'sedex')
            if (cotacao_sedex) cotacoes.push(cotacao_sedex)
        } else {
            // Outras: transportadora convencional
            const cotacao = gerarCotacao(input, transp.codigo, 'transportadora')
            if (cotacao) cotacoes.push(cotacao)
        }
    })

    // Ordenar por score
    cotacoes.sort((a, b) => b.score_recomendacao - a.score_recomendacao)

    // Definir destaques
    const mais_barato = cotacoes.reduce((min, cot) => cot.valor_total < min.valor_total ? cot : min, cotacoes[0])
    if (mais_barato) mais_barato.destaque = 'mais_barato'

    const mais_rapido = cotacoes.reduce((min, cot) => cot.prazo_entrega_dias < min.prazo_entrega_dias ? cot : min, cotacoes[0])
    if (mais_rapido && mais_rapido !== mais_barato) mais_rapido.destaque = 'mais_rapido'

    const mais_confiavel = cotacoes.reduce((max, cot) =>
        cot.transportadora.nota_avaliacao > max.transportadora.nota_avaliacao ? cot : max, cotacoes[0]
    )
    if (mais_confiavel && mais_confiavel !== mais_barato && mais_confiavel !== mais_rapido) {
        mais_confiavel.destaque = 'mais_confiavel'
    }

    // Economia
    const mais_caro = cotacoes.reduce((max, cot) => cot.valor_total > max.valor_total ? cot : max, cotacoes[0])
    const economia_maxima = mais_caro ? mais_caro.valor_total - mais_barato.valor_total : 0

    // Prazo mínimo
    const prazo_minimo = Math.min(...cotacoes.map(c => c.prazo_entrega_dias))

    return {
        input,
        cotacoes,
        recomendacao: cotacoes[0], // Melhor score
        economia_maxima: Math.round(economia_maxima * 100) / 100,
        prazo_minimo_dias: prazo_minimo
    }
}

/**
 * Calcula frete estimado rápido
 */
export function calcularFreteEstimado(
    peso_kg: number,
    uf_origem: string,
    uf_destino: string,
    customer_group: CustomerGroup
): number {
    const distancia_km = calcularDistanciaAproximada(uf_origem, uf_destino)
    const valor_base = calcularValorFrete(peso_kg, peso_kg / 300, distancia_km, 'transportadora', false, customer_group)
    return Math.round(valor_base * 100) / 100
}
