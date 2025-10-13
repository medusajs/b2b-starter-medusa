'use client'

/**
 * QuotesList Component
 * 
 * List view of quotes with filtering and sorting
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@ysh/ui'
import { Button } from "@medusajs/ui"
import { Badge } from '@ysh/ui'
import { FileText, Download, Copy, Trash2, Eye, ArrowUpDown } from 'lucide-react'
import useQuotesList from '../hooks/useQuotesList'
import useQuoteOperations from '../hooks/useQuoteOperations'
import type { QuoteStatus } from '../types'

interface QuotesListProps {
    onViewQuote?: (id: string) => void
    onEditQuote?: (id: string) => void
}

export default function QuotesList({ onViewQuote, onEditQuote }: QuotesListProps) {
    const {
        quotes,
        sortBy,
        sortOrder,
        isLoading,
        toggleSortOrder,
        changeSortBy
    } = useQuotesList()

    const {
        duplicateQuote,
        deleteQuote,
        exportQuote,
        isProcessing
    } = useQuoteOperations()

    const getStatusColor = (status: QuoteStatus) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'expired': return 'bg-gray-100 text-gray-800'
            case 'converted': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: QuoteStatus) => {
        const labels: Record<QuoteStatus, string> = {
            draft: 'Rascunho',
            pending: 'Pendente',
            approved: 'Aprovado',
            rejected: 'Rejeitado',
            expired: 'Expirado',
            converted: 'Convertido'
        }
        return labels[status] || status
    }

    const handleDuplicate = async (id: string) => {
        if (window.confirm('Deseja duplicar esta cotação?')) {
            const newQuote = await duplicateQuote(id)
            if (newQuote && onEditQuote) {
                onEditQuote(newQuote.id)
            }
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta cotação?')) {
            await deleteQuote(id)
        }
    }

    const handleExport = async (id: string) => {
        await exportQuote(id)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header with sorting */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Cotações</h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            changeSortBy('date')
                            toggleSortOrder()
                        }}
                    >
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Data {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            changeSortBy('value')
                            toggleSortOrder()
                        }}
                    >
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Valor {sortBy === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Button>
                </div>
            </div>

            {/* Quotes list */}
            {quotes.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhuma cotação encontrada</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {quotes.map((quote) => (
                        <Card key={quote.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg mb-1">
                                            {quote.quote_number}
                                        </CardTitle>
                                        <div className="text-sm text-muted-foreground">
                                            {quote.customer_name}
                                            {quote.company_name && ` - ${quote.company_name}`}
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(quote.status)}>
                                        {getStatusLabel(quote.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="text-2xl font-bold">
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            }).format(quote.total)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {quote.item_count} {quote.item_count === 1 ? 'item' : 'itens'}
                                            {quote.system_capacity_kwp && ` • ${quote.system_capacity_kwp} kWp`}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Criado em {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                                            {quote.is_expired && ' • Expirado'}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onViewQuote?.(quote.id)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport(quote.id)}
                                            disabled={isProcessing}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDuplicate(quote.id)}
                                            disabled={isProcessing}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        {quote.status === 'draft' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(quote.id)}
                                                disabled={isProcessing}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
