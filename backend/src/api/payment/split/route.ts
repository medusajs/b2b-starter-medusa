/**
 * PAYMENT SPLIT API
 * Gerencia splits de pagamento e repasses
 * 
 * POST /api/payment/split/create - Cria execução de split
 * GET /api/payment/split/[id] - Detalhes de um split
 * POST /api/payment/split/[id]/process - Processa repasses
 * GET /api/payment/split/recipients - Lista recipients
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * POST /api/payment/split/create
 * Cria uma execução de split baseado em custos reais
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const body = req.body as {
            payment_transaction_id: string
            order_id?: string
            total_amount_brl: number
            gateway_fee_brl: number
            cost_breakdown: {
                custo_kit_reais: number
                custo_dossie_tecnico_homologacao_reais: number
                custo_mao_de_obra_reais: number
                valor_total_projeto_reais: number
            }
            distributor_code: string
        }

        const {
            payment_transaction_id,
            order_id,
            total_amount_brl,
            gateway_fee_brl,
            cost_breakdown,
            distributor_code,
        } = body

        // Validação
        if (!payment_transaction_id || !total_amount_brl || !cost_breakdown) {
            res.status(400).json({
                error: "Missing required fields",
                required: ["payment_transaction_id", "total_amount_brl", "cost_breakdown"],
            })
            return
        }

        // Calcula valor líquido
        const netAmountBrl = total_amount_brl - gateway_fee_brl

        // Define splits baseados em custos reais
        const splits = []
        let totalSplits = 0

        // Split 1: Distribuidor (Kit completo)
        const kitAmount = cost_breakdown.custo_kit_reais
        splits.push({
            recipient_id: `distributor_${distributor_code}`,
            recipient_type: "distributor",
            recipient_name: `Distributor ${distributor_code}`,
            split_amount_brl: kitAmount,
            split_percentage: (kitAmount / netAmountBrl) * 100,
            calculation_method: "cost_based",
            cost_key: "custo_kit_reais",
            transfer_fee_brl: 3.49,  // Taxa Asaas para terceiros
            net_amount_brl: kitAmount - 3.49,
            status: "pending",
            scheduled_transfer_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            actual_transfer_date: null,
            asaas_transfer_id: null,
        })
        totalSplits += kitAmount

        // Split 2: Dossiê Técnico + Homologação
        const dossieAmount = cost_breakdown.custo_dossie_tecnico_homologacao_reais
        splits.push({
            recipient_id: "technical_dossier_provider",
            recipient_type: "technical_dossier",
            recipient_name: "Technical Dossier & Homologation Services",
            split_amount_brl: dossieAmount,
            split_percentage: (dossieAmount / netAmountBrl) * 100,
            calculation_method: "cost_based",
            cost_key: "custo_dossie_tecnico_homologacao_reais",
            transfer_fee_brl: 3.49,
            net_amount_brl: dossieAmount - 3.49,
            status: "pending",
            scheduled_transfer_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            actual_transfer_date: null,
            asaas_transfer_id: null,
        })
        totalSplits += dossieAmount

        // Split 3: Mão de Obra (Instalação)
        const laborAmount = cost_breakdown.custo_mao_de_obra_reais
        splits.push({
            recipient_id: "installation_labor_provider",
            recipient_type: "labor",
            recipient_name: "Installation Labor Services",
            split_amount_brl: laborAmount,
            split_percentage: (laborAmount / netAmountBrl) * 100,
            calculation_method: "cost_based",
            cost_key: "custo_mao_de_obra_reais",
            transfer_fee_brl: 3.49,
            net_amount_brl: laborAmount - 3.49,
            status: "pending",
            scheduled_transfer_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            actual_transfer_date: null,
            asaas_transfer_id: null,
        })
        totalSplits += laborAmount

        // Split 4: Plataforma YSH (Saldo restante)
        const platformAmount = netAmountBrl - totalSplits
        const platformPercent = (platformAmount / netAmountBrl) * 100
        splits.push({
            recipient_id: "ysh_platform",
            recipient_type: "platform",
            recipient_name: "YSH Platform Commission",
            split_amount_brl: platformAmount,
            split_percentage: platformPercent,
            calculation_method: "dynamic",
            cost_key: null,
            transfer_fee_brl: 0.00,  // Conta principal, grátis
            net_amount_brl: platformAmount,
            status: "pending",
            scheduled_transfer_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            actual_transfer_date: null,
            asaas_transfer_id: null,
        })
        totalSplits += platformAmount

        // Calcula total de taxas de transferência
        const totalTransferFees = splits.reduce((sum, split) => sum + split.transfer_fee_brl, 0)

        // Cria split execution
        const splitExecution = {
            id: `split_exec_${Date.now()}`,
            payment_transaction_id,
            order_id,
            split_rule_id: null,
            total_amount_brl,
            gateway_fee_brl,
            net_amount_brl: netAmountBrl,
            splits,
            total_splits_amount_brl: totalSplits,
            total_transfer_fees_brl: totalTransferFees,
            remaining_balance_brl: netAmountBrl - totalSplits,
            status: "pending",
            all_transfers_completed: false,
            completed_transfers_count: 0,
            failed_transfers_count: 0,
            metadata: {
                cost_breakdown,
                distributor_code,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        // TODO: Persist to database
        // await container.resolve("splitExecutionService").create(splitExecution)

        res.status(201).json({
            split_execution: splitExecution,
            summary: {
                total_recipients: splits.length,
                total_amount_brl: totalSplits,
                total_fees_brl: totalTransferFees,
                platform_share_brl: platformAmount,
                platform_share_percent: platformPercent.toFixed(2),
            },
        })
    } catch (error) {
        console.error("Split creation error:", error)
        const err = error as Error
        res.status(500).json({
            error: "Failed to create split",
            message: err.message,
        })
    }
}

/**
 * GET /api/payment/split/recipients
 * Lista recipients de split disponíveis
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        const query = req.scope.resolve("query")

        // Load recipients
        const recipients = await query.graph({
            entity: "payment_split_recipient",
            fields: [
                "id",
                "recipient_type",
                "recipient_code",
                "recipient_name",
                "asaas_account_id",
                "pix_key",
                "pix_key_type",
                "default_split_percentage",
                "calculation_method",
                "commission_percentage",
                "transfer_fee_brl",
                "active",
                "verified",
            ],
            filters: { active: true },
        })

        // Agrupa por tipo
        const groupedByType = recipients.data.reduce((acc: any, recipient: any) => {
            const type = recipient.recipient_type
            if (!acc[type]) {
                acc[type] = []
            }
            acc[type].push(recipient)
            return acc
        }, {})

        res.status(200).json({
            recipients: recipients.data,
            grouped_by_type: groupedByType,
            total_recipients: recipients.data.length,
            recipient_types: Object.keys(groupedByType),
        })
    } catch (error) {
        console.error("Recipients list error:", error)
        const err = error as Error
        res.status(500).json({
            error: "Failed to load recipients",
            message: err.message,
        })
    }
}
