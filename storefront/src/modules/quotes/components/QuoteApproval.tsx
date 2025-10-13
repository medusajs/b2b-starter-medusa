'use client'

/**
 * QuoteApproval Component
 * 
 * Component for approving/rejecting quotes (B2B)
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@ysh/ui'
import { YshButton as Button } from '@ysh/ui'
import { Badge } from '@ysh/ui'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import useQuoteApprovals from '../hooks/useQuoteApprovals'
import type { QuoteApproval as QuoteApprovalType } from '../types'
import { toast } from '@medusajs/ui'

interface QuoteApprovalProps {
  quoteId: string
  approvals: QuoteApprovalType[]
  canApprove?: boolean
  onApprovalChange?: () => void
}

export default function QuoteApproval({
  quoteId,
  approvals,
  canApprove = false,
  onApprovalChange
}: QuoteApprovalProps) {
  const { approveQuote, rejectQuote, isProcessing } = useQuoteApprovals()
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [comments, setComments] = useState('')
  const [conditions, setConditions] = useState<string[]>([])
  const [requestedChanges, setRequestedChanges] = useState<string[]>([])

  const pendingApproval = approvals.find(
    a => a.status === 'pending' && canApprove
  )

  const handleApprove = async () => {
    if (!pendingApproval) return

    const success = await approveQuote(
      quoteId,
      pendingApproval.id,
      comments,
      conditions.filter(c => c.trim())
    )

    if (success) {
      setShowApprovalForm(false)
      setComments('')
      setConditions([])
      onApprovalChange?.()
    }
  }

  const handleReject = async () => {
    if (!pendingApproval) return

    if (!comments.trim()) {
      toast.warning('Por favor, adicione um comentário explicando a rejeição', {
        duration: 3000,
      })
      return
    }

    const success = await rejectQuote(
      quoteId,
      pendingApproval.id,
      comments,
      requestedChanges.filter(c => c.trim())
    )

    if (success) {
      setShowApprovalForm(false)
      setComments('')
      setRequestedChanges([])
      onApprovalChange?.()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-4">
      {/* Approval List */}
      <Card>
        <CardHeader>
          <CardTitle>Aprovações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div key={approval.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="mt-1">
                  {getStatusIcon(approval.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{approval.approver_name}</span>
                    <Badge className={getStatusColor(approval.status)}>
                      {getStatusLabel(approval.status)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {approval.approver_role}
                  </div>
                  {approval.decision_date && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(approval.decision_date).toLocaleString('pt-BR')}
                    </div>
                  )}
                  {approval.comments && (
                    <div className="mt-2 text-sm p-2 bg-gray-50 rounded">
                      {approval.comments}
                    </div>
                  )}
                  {approval.conditions && approval.conditions.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-1">Condições:</div>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {approval.conditions.map((condition, i) => (
                          <li key={i}>{condition}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {approval.requested_changes && approval.requested_changes.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-1">Alterações Solicitadas:</div>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {approval.requested_changes.map((change, i) => (
                          <li key={i}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Form */}
      {pendingApproval && canApprove && (
        <Card>
          <CardHeader>
            <CardTitle>Sua Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            {!showApprovalForm ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowApprovalForm(true)}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalForm(true)}
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Comentários
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    rows={3}
                    placeholder="Adicione seus comentários sobre esta cotação"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Condições (opcional)
                  </label>
                  <textarea
                    value={conditions.join('\n')}
                    onChange={(e) => setConditions(e.target.value.split('\n'))}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="Uma condição por linha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Alterações Solicitadas (opcional)
                  </label>
                  <textarea
                    value={requestedChanges.join('\n')}
                    onChange={(e) => setRequestedChanges(e.target.value.split('\n'))}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                    placeholder="Uma alteração por linha"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar Cotação
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar Cotação
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowApprovalForm(false)}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
