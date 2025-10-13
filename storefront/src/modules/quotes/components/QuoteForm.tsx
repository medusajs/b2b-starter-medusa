'use client'

/**
 * QuoteForm Component
 * 
 * Form for creating/editing quotes
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@ysh/ui'
import { Button } from "@medusajs/ui"
import { Plus, Trash2, Save } from 'lucide-react'
import useQuoteOperations from '../hooks/useQuoteOperations'
import type { QuoteInput } from '../types'

interface QuoteFormProps {
  customerId: string
  companyId?: string
  onSuccess?: (quoteId: string) => void
  onCancel?: () => void
}

export default function QuoteForm({
  customerId,
  companyId,
  onSuccess,
  onCancel
}: QuoteFormProps) {
  const { createQuote, isProcessing } = useQuoteOperations()

  const [items, setItems] = useState<QuoteInput['items']>([{
    product_id: '',
    quantity: 1,
    discount: 0
  }])

  const [formData, setFormData] = useState({
    valid_days: 15,
    payment_terms: '',
    customer_notes: '',
    internal_notes: ''
  })

  const handleAddItem = () => {
    setItems([...items, {
      product_id: '',
      quantity: 1,
      discount: 0
    }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const input: QuoteInput = {
      customer_id: customerId,
      company_id: companyId,
      type: 'standard',
      items: items,
      valid_days: formData.valid_days,
      payment_terms: formData.payment_terms,
      customer_notes: formData.customer_notes,
      internal_notes: formData.internal_notes
    }

    const quote = await createQuote(input)
    if (quote && onSuccess) {
      onSuccess(quote.id)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Itens da Cotação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border rounded">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Produto ID
                      </label>
                      <input
                        type="text"
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Desconto (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={item.discount || 0}
                        onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Observações
                      </label>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Observações sobre o item"
                      />
                    </div>
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Validade (dias)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={formData.valid_days}
                onChange={(e) => setFormData({ ...formData, valid_days: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Condições de Pagamento
              </label>
              <input
                type="text"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Ex: À vista ou parcelado em até 12x"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Observações para o Cliente
              </label>
              <textarea
                value={formData.customer_notes}
                onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows={3}
                placeholder="Observações visíveis ao cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Notas Internas
              </label>
              <textarea
                value={formData.internal_notes}
                onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows={3}
                placeholder="Notas internas (não visíveis ao cliente)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isProcessing}>
            <Save className="h-4 w-4 mr-2" />
            {isProcessing ? 'Salvando...' : 'Salvar Cotação'}
          </Button>
        </div>
      </div>
    </form>
  )
}
