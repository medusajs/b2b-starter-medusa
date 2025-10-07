/**
 * Workflow: Proposta FV Assistida por IA (Hélio)
 * Usa RAG para sugerir produtos, calcular dimensionamento e validar viabilidade
 * 
 * NOTA: Workflow temporariamente desabilitado devido a refatoração necessária
 * para compatibilidade com Medusa Framework 2.8.0
 */

/* TEMPORARIAMENTE COMENTADO - REFATORAR STEPS
import { createWorkflow, createStep, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

// ==========================================
// Types
// ==========================================

type PropostaAssistidaInput = {
    // Dados do lead
    customer_id: string
    cep: string
    consumo_kwh_mes: number
    tipo_telhado?: 'laje' | 'ceramica' | 'metalico' | 'solo'
    fase?: 'mono' | 'bi' | 'tri'

    // Preferências
    budget_max?: number
    prazo_meses?: number
    oversizing_target?: 114 | 130 | 145 | 160
}

type PropostaAssistidaOutput = {
    proposal_id: string
    dimensionamento: {
        kwp_proposto: number
        geracao_anual_mwh: number
        performance_ratio: number
        oversizing_ratio: number
    }
    produtos_sugeridos: {
        painel: any
        inversor: any
        estrutura: any
        acessorios: any[]
    }
    financeiro: {
        capex_total: number
        payback_anos: number
        tir_percentual: number
        parcela_mensal?: number
    }
    validacoes: {
        mmgd_compliant: boolean
        tarifa_encontrada: boolean
        irradiancia_disponivel: boolean
        produtos_disponiveis: boolean
    }
    helio_confidence: number
    next_steps: string[]
}

// ==========================================
// Step 1: Consultar dados geoespaciais (RAG)
// ==========================================

const consultarDadosGeoespaciaisStep = createStep(
    "consultar-dados-geoespaciais",
    async ({ cep }: { cep: string }) => {
        // Consultar Qdrant KB: ysh-geospatial
        const response = await fetch('http://localhost:3002/api/rag/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                collection: 'ysh-geospatial',
                query: `CEP ${cep} irradiância HSP temperatura`,
                top_k: 3
            })
        })

        const results = await response.json()

        if (!results.matches || results.matches.length === 0) {
            throw new Error(`Dados geoespaciais não encontrados para CEP ${cep}`)
        }

        const geo = results.matches[0].payload

        return new StepResponse({
            cep,
            municipio: geo.municipio,
            uf: geo.uf,
            hsp_anual_medio: geo.hsp,
            irradiancia_ghi: geo.irradiancia,
            temp_media: geo.temp_media,
            lat: geo.lat,
            lon: geo.lon
        })
    }
)

// ==========================================
// Step 2: Consultar tarifa (RAG)
// ==========================================

const consultarTarifaStep = createStep(
    "consultar-tarifa",
    async ({ uf, classe, fase }: { uf: string, classe: string, fase: string }) => {
        const response = await fetch('http://localhost:3002/api/rag/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                collection: 'ysh-tariffs',
                query: `${uf} classe ${classe} ${fase} tarifa kWh`,
                top_k: 1
            })
        })

        const results = await response.json()

        if (!results.matches || results.matches.length === 0) {
            throw new Error(`Tarifa não encontrada para UF=${uf}, Classe=${classe}`)
        }

        const tarifa = results.matches[0].payload

        return new StepResponse({
            distribuidora: tarifa.distribuidora,
            classe: tarifa.classe,
            tarifa_kwh: tarifa.tarifa_kwh,
            tributos: tarifa.tributos
        })
    }
)

// ==========================================
// Step 3: Calcular dimensionamento PV
// ==========================================

const calcularDimensionamentoStep = createStep(
    "calcular-dimensionamento",
    async ({
        consumo_kwh_mes,
        hsp,
        oversizing_target
    }: {
        consumo_kwh_mes: number
        hsp: number
        oversizing_target: number
    }) => {
        // Consumo anual
        const consumo_anual_kwh = consumo_kwh_mes * 12

        // kWp necessário (com oversizing)
        const kwp_proposto = (consumo_anual_kwh / (hsp * 365 * 0.82)) * (oversizing_target / 100)

        // Geração esperada
        const geracao_anual_mwh = (kwp_proposto * hsp * 365 * 0.82) / 1000

        // Performance Ratio (padrão)
        const pr = 0.82

        return new StepResponse({
            kwp_proposto: Math.round(kwp_proposto * 100) / 100,
            geracao_anual_mwh: Math.round(geracao_anual_mwh * 100) / 100,
            performance_ratio: pr,
            oversizing_ratio: oversizing_target / 100,
            consumo_anual_kwh
        })
    }
)

// ==========================================
// Step 4: Sugerir produtos (RAG)
// ==========================================

const sugerirProdutosStep = createStep(
    "sugerir-produtos",
    async ({ kwp_proposto, fase }: { kwp_proposto: number, fase: string }) => {
        // Consultar catálogo via RAG
        const [painelRes, inversorRes] = await Promise.all([
            // Painel
            fetch('http://localhost:3002/api/rag/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'ysh-catalog',
                    query: `painel solar ${kwp_proposto} Wp mono PERC alta eficiência`,
                    top_k: 3
                })
            }),

            // Inversor
            fetch('http://localhost:3002/api/rag/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'ysh-catalog',
                    query: `inversor ${fase}fásico ${kwp_proposto} kW MPPT`,
                    top_k: 3
                })
            })
        ])

        const paineis = await painelRes.json()
        const inversores = await inversorRes.json()

        return new StepResponse({
            painel: paineis.matches[0]?.payload || null,
            inversor: inversores.matches[0]?.payload || null,
            estrutura: null, // TODO: implementar
            acessorios: [] // TODO: implementar
        })
    }
)

// ==========================================
// Step 5: Calcular financeiro (RAG)
// ==========================================

const calcularFinanceiroStep = createStep(
    "calcular-financeiro",
    async ({
        kwp_proposto,
        tarifa_kwh,
        consumo_anual_kwh,
        prazo_meses
    }: {
        kwp_proposto: number
        tarifa_kwh: number
        consumo_anual_kwh: number
        prazo_meses: number
    }) => {
        // CAPEX estimado (R$ 4.000/kWp)
        const capex_kwp = 4000
        const capex_total = kwp_proposto * capex_kwp

        // Economia anual
        const economia_anual = consumo_anual_kwh * tarifa_kwh

        // Payback simples
        const payback_anos = capex_total / economia_anual

        // TIR aproximada (fórmula simplificada)
        const tir_percentual = (economia_anual / capex_total) * 100

        // Consultar opções de crédito via RAG
        const creditoRes = await fetch('http://localhost:3002/api/rag/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                collection: 'ysh-finance',
                query: `financiamento solar ${prazo_meses} meses valor ${capex_total}`,
                top_k: 1
            })
        })

        const credito = await creditoRes.json()
        const taxa_mensal = credito.matches[0]?.payload?.taxa_mensal || 1.5

        // Parcela (Price)
        const taxa = taxa_mensal / 100
        const parcela_mensal = capex_total * (taxa * Math.pow(1 + taxa, prazo_meses)) / (Math.pow(1 + taxa, prazo_meses) - 1)

        return new StepResponse({
            capex_total: Math.round(capex_total * 100) / 100,
            payback_anos: Math.round(payback_anos * 10) / 10,
            tir_percentual: Math.round(tir_percentual * 10) / 10,
            parcela_mensal: Math.round(parcela_mensal * 100) / 100,
            economia_anual
        })
    }
)

// ==========================================
// Step 6: Criar proposta no Medusa
// ==========================================

const criarPropostaStep = createStep(
    "criar-proposta",
    async ({
        customer_id,
        dimensionamento,
        produtos,
        financeiro
    }: any, { container }: any) => {
        const quoteModuleService = container.resolve("quoteModuleService")

        const quote = await quoteModuleService.createQuotes({
            customer_id,
            status: "draft",
            metadata: {
                helio_assisted: true,
                dimensionamento,
                produtos_sugeridos: produtos,
                financeiro,
                created_by: "helio.core"
            }
        })

        return new StepResponse({
            proposal_id: quote.id,
            created_at: quote.created_at
        })
    }
)

// ==========================================
// Workflow Principal
// ==========================================

export const propostaAssistidaWorkflow = createWorkflow<
    PropostaAssistidaInput,
    PropostaAssistidaOutput
>("proposta-assistida-helio", async (input) => {
    // Etapa 1: Dados geoespaciais
    const geo = await consultarDadosGeoespaciaisStep({ cep: input.cep })

    // Etapa 2: Tarifa
    const tarifa = await consultarTarifaStep({
        uf: geo.uf,
        classe: 'B1', // TODO: receber do input
        fase: input.fase || 'mono'
    })

    // Etapa 3: Dimensionamento
    const dimensionamento = await calcularDimensionamentoStep({
        consumo_kwh_mes: input.consumo_kwh_mes,
        hsp: geo.hsp_anual_medio,
        oversizing_target: input.oversizing_target || 130
    })

    // Etapa 4: Produtos
    const produtos = await sugerirProdutosStep({
        kwp_proposto: dimensionamento.kwp_proposto,
        fase: input.fase || 'mono'
    })

    // Etapa 5: Financeiro
    const financeiro = await calcularFinanceiroStep({
        kwp_proposto: dimensionamento.kwp_proposto,
        tarifa_kwh: tarifa.tarifa_kwh,
        consumo_anual_kwh: dimensionamento.consumo_anual_kwh,
        prazo_meses: input.prazo_meses || 60
    })

    // Etapa 6: Criar proposta
    const proposta = await criarPropostaStep({
        customer_id: input.customer_id,
        dimensionamento,
        produtos,
        financeiro
    })

    // Validações
    const validacoes = {
        mmgd_compliant: dimensionamento.oversizing_ratio <= 1.60,
        tarifa_encontrada: !!tarifa.distribuidora,
        irradiancia_disponivel: !!geo.hsp_anual_medio,
        produtos_disponiveis: !!(produtos.painel && produtos.inversor)
    }

    // Calcular confiança do Hélio
    const confidence_score = Object.values(validacoes).filter(Boolean).length / Object.keys(validacoes).length

    return new WorkflowResponse({
        proposal_id: proposta.proposal_id,
        dimensionamento: {
            kwp_proposto: dimensionamento.kwp_proposto,
            geracao_anual_mwh: dimensionamento.geracao_anual_mwh,
            performance_ratio: dimensionamento.performance_ratio,
            oversizing_ratio: dimensionamento.oversizing_ratio
        },
        produtos_sugeridos: produtos,
        financeiro: {
            capex_total: financeiro.capex_total,
            payback_anos: financeiro.payback_anos,
            tir_percentual: financeiro.tir_percentual,
            parcela_mensal: financeiro.parcela_mensal
        },
        validacoes,
        helio_confidence: Math.round(confidence_score * 100),
        next_steps: [
            "Validar produtos com cliente",
            "Agendar vistoria técnica",
            "Aprovar financiamento",
            "Iniciar homologação"
        ]
    })
})

export default propostaAssistidaWorkflow
*/

// Placeholder temporário até refatoração
export const propostaAssistidaWorkflow = null
export default null
