'use client'

/**
 * QuoteDetails Component
 * 
 * Detailed view of a single quote
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@ysh/ui'
import { Button } from '@ysh/ui'
import { Badge } from '@ysh/ui'
import { Download, ShoppingCart, Copy, Edit } from 'lucide-react'
import { useQuotes } from '../context/QuotesContext'
import useQuoteOperations from '../hooks/useQuoteOperations'
import type { QuoteStatus } from '../types'
import Image from 'next/image'

interface QuoteDetailsProps {
    quoteId: string
    onEdit?: () => void
    onConvert?: (orderId: string) => void
}

export default function QuoteDetails({ quoteId, onEdit, onConvert }: QuoteDetailsProps) {
    const { currentQuote } = useQuotes()
    const {
        duplicateQuote,
        convertToOrder,
        exportQuote,
        isProcessing
    } = useQuoteOperations()

    if (!currentQuote || currentQuote.id !== quoteId) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const quote = currentQuote

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

    const handleDuplicate = async () => {
        await duplicateQuote(quote.id)
    }

    const handleConvert = async () => {
        if (window.confirm('Converter esta cotação em pedido?')) {
            const orderId = await convertToOrder(quote.id)
            if (orderId && onConvert) {
                onConvert(orderId)
            }
        }
    }

    const handleExport = async () => {
        await exportQuote(quote.id)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl mb-2">{quote.quote_number}</CardTitle>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <div>{quote.customer_name}</div>
                                {quote.company_name && <div>{quote.company_name}</div>}
                                <div>
                                    Criado em {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                                </div>
                                <div>
                                    Válido até {new Date(quote.expires_at).toLocaleDateString('pt-BR')}
                                </div>
                            </div>
                        </div>
                        <Badge className={getStatusColor(quote.status)}>
                            {quote.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Button onClick={handleExport} disabled={isProcessing}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar PDF
                        </Button>
                        <Button variant="outline" onClick={handleDuplicate} disabled={isProcessing}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                        </Button>
                        {quote.status === 'approved' && (
                            <Button onClick={handleConvert} disabled={isProcessing}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Converter em Pedido
                            </Button>
                        )}
                        {quote.status === 'draft' && onEdit && (
                            <Button variant="outline" onClick={onEdit}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Itens da Cotação</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {quote.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start border-b pb-4 last:border-0">
                                <div className="flex gap-4">
                                    {item.thumbnail && (
                                        <Image
                                            src={item.thumbnail}
                                            alt={item.title}
                                            width={64}
                                            height={64}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                        <div className="font-medium">{item.title}</div>
                                        <div className="text-sm text-muted-foreground">
                                            SKU: {item.sku}
                                        </div>
                                        {item.specs && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {item.specs.power_wp && `${item.specs.power_wp}Wp`}
                                                {item.specs.manufacturer && ` • ${item.specs.manufacturer}`}
                                            </div>
                                        )}
                                        <div className="text-sm mt-1">
                                            Quantidade: {item.quantity}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(item.total)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(item.unit_price)} / un
                                    </div>
                                    {item.discount > 0 && (
                                        <div className="text-xs text-green-600">
                                            -{item.discount}% desconto
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="space-y-2">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Subtotal</dt>
                            <dd className="font-medium">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(quote.financial.subtotal)}
                            </dd>
                        </div>
                        {quote.financial.discount_total > 0 && (
                            <div className="flex justify-between text-green-600">
                                <dt>Desconto</dt>
                                <dd>
                                    -{new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(quote.financial.discount_total)}
                                </dd>
                            </div>
                        )}
                        {quote.financial.shipping_total > 0 && (
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Frete</dt>
                                <dd className="font-medium">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(quote.financial.shipping_total)}
                                </dd>
                            </div>
                        )}
                        {quote.financial.installation_total > 0 && (
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Instalação</dt>
                                <dd className="font-medium">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(quote.financial.installation_total)}
                                </dd>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t">
                            <dt className="font-bold">Total</dt>
                            <dd className="font-bold text-xl">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(quote.financial.total)}
                            </dd>
                        </div>
                        {quote.financial.installments && (
                            <div className="pt-2 border-t">
                                <div className="text-sm text-muted-foreground">
                                    ou {quote.financial.installments.count}x de{' '}
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(quote.financial.installments.amount)}
                                </div>
                            </div>
                        )}
                    </dl>
                </CardContent>
            </Card>

            {/* System Info */}
            {quote.system && (
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-muted-foreground">Capacidade</dt>
                                <dd className="font-medium">{quote.system.capacity_kwp} kWp</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Painéis</dt>
                                <dd className="font-medium">
                                    {quote.system.panel_count}x {quote.system.panel_power_wp}Wp
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Inversores</dt>
                                <dd className="font-medium">
                                    {quote.system.inverter_count}x {quote.system.inverter_power_kw}kW
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Geração Mensal</dt>
                                <dd className="font-medium">
                                    {quote.system.estimated_generation_monthly.toLocaleString('pt-BR')} kWh
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Economia Mensal</dt>
                                <dd className="font-medium text-green-600">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(quote.system.estimated_savings_monthly)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Payback</dt>
                                <dd className="font-medium">
                                    {quote.system.payback_years.toFixed(1)} anos
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            )}

            {/* Notes */}
            {quote.customer_notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{quote.customer_notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
