'use client'

/**
 * QuoteComparison Component
 * 
 * Side-by-side comparison of multiple quotes
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@ysh/ui'
import { Badge } from '@/components/ui/badge'
import type { Quote } from '../types'

interface QuoteComparisonProps {
  quotes: Quote[]
}

export default function QuoteComparison({ quotes }: QuoteComparisonProps) {
  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Selecione cotações para comparar
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 bg-gray-50">Característica</th>
            {quotes.map((quote) => (
              <th key={quote.id} className="p-4 bg-gray-50">
                <div className="text-center">
                  <div className="font-medium">{quote.quote_number}</div>
                  <Badge className="mt-1">{quote.status}</Badge>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-4 font-medium">Cliente</td>
            {quotes.map((quote) => (
              <td key={quote.id} className="p-4 text-center">
                {quote.customer_name}
              </td>
            ))}
          </tr>
          
          <tr className="border-b bg-gray-50">
            <td className="p-4 font-medium">Valor Total</td>
            {quotes.map((quote) => (
              <td key={quote.id} className="p-4 text-center font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(quote.financial.total)}
              </td>
            ))}
          </tr>
          
          <tr className="border-b">
            <td className="p-4 font-medium">Número de Itens</td>
            {quotes.map((quote) => (
              <td key={quote.id} className="p-4 text-center">
                {quote.item_count}
              </td>
            ))}
          </tr>
          
          {quotes.some(q => q.system) && (
            <>
              <tr className="border-b bg-gray-50">
                <td className="p-4 font-medium">Capacidade (kWp)</td>
                {quotes.map((quote) => (
                  <td key={quote.id} className="p-4 text-center">
                    {quote.system?.capacity_kwp || '-'}
                  </td>
                ))}
              </tr>
              
              <tr className="border-b">
                <td className="p-4 font-medium">Geração Mensal (kWh)</td>
                {quotes.map((quote) => (
                  <td key={quote.id} className="p-4 text-center">
                    {quote.system?.estimated_generation_monthly.toLocaleString('pt-BR') || '-'}
                  </td>
                ))}
              </tr>
              
              <tr className="border-b bg-gray-50">
                <td className="p-4 font-medium">Economia Mensal</td>
                {quotes.map((quote) => (
                  <td key={quote.id} className="p-4 text-center">
                    {quote.system ? new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(quote.system.estimated_savings_monthly) : '-'}
                  </td>
                ))}
              </tr>
              
              <tr className="border-b">
                <td className="p-4 font-medium">Payback (anos)</td>
                {quotes.map((quote) => (
                  <td key={quote.id} className="p-4 text-center">
                    {quote.system?.payback_years.toFixed(1) || '-'}
                  </td>
                ))}
              </tr>
            </>
          )}
          
          <tr className="border-b bg-gray-50">
            <td className="p-4 font-medium">Validade</td>
            {quotes.map((quote) => (
              <td key={quote.id} className="p-4 text-center">
                {new Date(quote.expires_at).toLocaleDateString('pt-BR')}
              </td>
            ))}
          </tr>
          
          <tr className="border-b">
            <td className="p-4 font-medium">Condições de Pagamento</td>
            {quotes.map((quote) => (
              <td key={quote.id} className="p-4 text-center text-sm">
                {quote.financial.payment_terms || '-'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
