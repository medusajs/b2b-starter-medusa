"use client"

import { StatusBadge } from "@medusajs/ui"

const StatusTitles: Record<string, string> = {
  accepted: "Aprovado",
  customer_rejected: "Rejeitado pelo Cliente",
  merchant_rejected: "Rejeitado pelo Vendedor",
  pending_merchant: "Pendente Vendedor",
  pending_customer: "Pendente Cliente",
  pending_review: "Em revisão Comercial",
  pending_approval: "Aguardando Aprovação Interna",
  approved: "Aprovado",
  rejected: "Rejeitado",
}

const StatusColors: Record<string, "green" | "orange" | "red" | "blue"> = {
  accepted: "green",
  customer_rejected: "red",
  merchant_rejected: "red",
  pending_merchant: "orange",
  pending_customer: "orange",
  pending_review: "Em revis�o Comercial",
  pending_approval: "Aguardando Aprova��o Interna",
  approved: "green",
  rejected: "red",
}

export default function QuoteStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge color={StatusColors[status]}>
      {StatusTitles[status]}
    </StatusBadge>
  )
}

