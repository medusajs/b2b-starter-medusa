/**
 * Exemplo de Página de Produtos com API Resiliente
 * Demonstra uso completo do sistema de fallback
 */

import { Suspense } from 'react'
import { ResilientAPI } from '@/lib/api/resilient'
import { FallbackBadge } from '@/components/ui/offline-banner'
import { Loader2 } from 'lucide-react'

// ==========================================
// Server Component - Lista de Produtos
// ==========================================

async function ProductsList({ category, limit = 12 }: { category?: string, limit?: number }) {
  // API resiliente: tenta backend, fallback automático se offline
  const response = await ResilientAPI.listProducts({
    category,
    limit,
    fallback: true // ativa fallback automático
  })

  const { data, error, fromFallback, backendOnline } = response

  if (error && !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erro ao carregar produtos: {error}</p>
      </div>
    )
  }

  const products = data?.products || []

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nenhum produto encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Indicador de Fallback */}
      {fromFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FallbackBadge />
            <div className="flex-1">
              <p className="text-sm text-amber-900 font-medium">
                Modo Offline Ativo
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Exibindo catálogo local. Preços e estoque podem não estar atualizados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} fromFallback={fromFallback} />
        ))}
      </div>

      {/* Info de Backend */}
      <div className="text-center text-sm text-gray-500">
        {backendOnline ? (
          <span>✅ Conectado ao backend</span>
        ) : (
          <span>⚠️ Backend offline - usando dados locais</span>
        )}
      </div>
    </div>
  )
}

// ==========================================
// Product Card Component
// ==========================================

function ProductCard({ product, fromFallback }: { product: any, fromFallback: boolean }) {
  const price = product.price || product.variants?.[0]?.prices?.[0]?.amount || 0
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price / 100)

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Badge de Fallback */}
      {fromFallback && (
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-block px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded">
            Local
          </span>
        </div>
      )}

      {/* Imagem */}
      <div className="aspect-square bg-gray-100 relative">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm">Sem imagem</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        {product.manufacturer && (
          <p className="text-xs text-gray-500">
            {product.manufacturer}
          </p>
        )}

        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {formattedPrice}
            </p>
            {product.sku && (
              <p className="text-xs text-gray-500">
                SKU: {product.sku}
              </p>
            )}
          </div>

          {/* Status de Estoque */}
          {product.availability !== undefined && (
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              product.availability 
                ? 'text-green-700 bg-green-50 border border-green-200'
                : 'text-gray-600 bg-gray-100 border border-gray-200'
            }`}>
              {product.availability ? 'Em Estoque' : 'Indisponível'}
            </span>
          )}
        </div>

        {/* Botão (desabilitado se offline) */}
        <button
          disabled={fromFallback}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            fromFallback
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {fromFallback ? 'Checkout Indisponível' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </div>
  )
}

// ==========================================
// Loading Component
// ==========================================

function ProductsLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-gray-600">Carregando produtos...</p>
      </div>
    </div>
  )
}

// ==========================================
// Main Page Component
// ==========================================

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { category?: string }
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {searchParams.category || 'Todos os Produtos'}
        </h1>
        <p className="mt-2 text-gray-600">
          Navegue pelo nosso catálogo de equipamentos solares
        </p>
      </div>

      {/* Products List com Suspense */}
      <Suspense fallback={<ProductsLoading />}>
        <ProductsList category={searchParams.category} />
      </Suspense>
    </div>
  )
}

// ==========================================
// Metadata
// ==========================================

export const metadata = {
  title: 'Produtos Solares | YSH Store',
  description: 'Catálogo completo de equipamentos para energia solar fotovoltaica'
}
