/**
 * Product Comparison Page
 * /produtos/comparar
 */

import { Metadata } from 'next'
import { ProductComparison } from '../../../../../modules/catalog/components/ProductComparison'

export const metadata: Metadata = {
    title: 'Comparar Produtos - YSH Solar Hub',
    description: 'Compare produtos fotovoltaicos lado a lado por SKU',
}

export default function ComparationPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Comparação de Produtos
                </h1>
                <p className="text-gray-600">
                    Compare até 3 produtos lado a lado. Digite o SKU de cada produto que deseja comparar.
                </p>
            </div>

            <ProductComparison maxProducts={3} />
        </div>
    )
}
