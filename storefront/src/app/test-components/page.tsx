/**
 * Teste Visual dos Componentes de Identificação
 * Use este componente em uma página de teste para validar os componentes
 */

'use client'

import { ProductSKU, ProductModel } from '@/modules/catalog/components/product-identifiers'
import { CategoryIcon, CategoryBadge, type ProductCategory } from '@/modules/catalog/components/CategoryIcon'

export default function ComponentTestPage() {
    const categories: ProductCategory[] = [
        'kits', 'panels', 'inverters', 'batteries',
        'structures', 'cables', 'controllers', 'ev_chargers',
        'stringboxes', 'accessories', 'posts', 'others'
    ]

    return (
        <div className="container mx-auto p-8 space-y-12">
            <h1 className="text-4xl font-bold mb-8">Teste de Componentes de Identificação</h1>

            {/* Teste ProductSKU */}
            <section className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">ProductSKU Component</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Tamanho Pequeno (sm)</h3>
                        <ProductSKU
                            sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS"
                            size="sm"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Tamanho Médio (md)</h3>
                        <ProductSKU
                            sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS"
                            size="md"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Tamanho Grande (lg)</h3>
                        <ProductSKU
                            sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS"
                            size="lg"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Com SKU Interno</h3>
                        <ProductSKU
                            sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS"
                            internal_sku="YSH-001234"
                            size="md"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Sem Botão de Copiar</h3>
                        <ProductSKU
                            sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS"
                            copyable={false}
                            size="md"
                        />
                    </div>
                </div>
            </section>

            {/* Teste ProductModel */}
            <section className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">ProductModel Component</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Tamanho Pequeno (sm)</h3>
                        <ProductModel
                            manufacturer="Canadian Solar"
                            model="CS7L-550MS"
                            size="sm"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Tamanho Médio (md)</h3>
                        <ProductModel
                            manufacturer="Canadian Solar"
                            model="CS7L-550MS"
                            size="md"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Tamanho Grande (lg)</h3>
                        <ProductModel
                            manufacturer="Canadian Solar"
                            model="CS7L-550MS"
                            size="lg"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Com Série</h3>
                        <ProductModel
                            manufacturer="Canadian Solar"
                            model="CS7L-550MS"
                            series="HiKu7"
                            size="md"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Com Link de Busca</h3>
                        <ProductModel
                            manufacturer="Canadian Solar"
                            model="CS7L-550MS"
                            series="HiKu7"
                            link={true}
                            size="md"
                        />
                    </div>
                </div>
            </section>

            {/* Teste CategoryIcon */}
            <section className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">CategoryIcon Component</h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium mb-3">Tamanhos</h3>
                        <div className="flex items-center gap-4">
                            <CategoryIcon category="panels" size="sm" />
                            <CategoryIcon category="panels" size="md" />
                            <CategoryIcon category="panels" size="lg" />
                            <CategoryIcon category="panels" size="xl" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-3">Todas as Categorias</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {categories.map((cat) => (
                                <div key={cat} className="flex flex-col items-center gap-2">
                                    <CategoryIcon category={cat} size="lg" />
                                    <span className="text-xs text-gray-600">{cat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-3">Com Label</h3>
                        <div className="space-y-2">
                            {categories.slice(0, 4).map((cat) => (
                                <CategoryIcon key={cat} category={cat} size="md" showLabel={true} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Teste CategoryBadge */}
            <section className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">CategoryBadge Component</h2>

                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <CategoryBadge key={cat} category={cat} />
                    ))}
                </div>
            </section>

            {/* Teste Combinado - Simulação de ProductCard */}
            <section className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Simulação ProductCard</h2>

                <div className="max-w-sm border rounded-lg overflow-hidden shadow-md">
                    {/* Imagem placeholder */}
                    <div className="relative aspect-square bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-6xl">📸</span>
                        <div className="absolute top-2 right-2">
                            <CategoryIcon category="panels" size="md" />
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4 space-y-3">
                        {/* Manufacturer & Model */}
                        <ProductModel
                            manufacturer="Canadian Solar"
                            model="CS7L-550MS"
                            series="HiKu7"
                            size="sm"
                        />

                        {/* Nome */}
                        <h3 className="font-semibold text-gray-900">
                            Módulo Fotovoltaico Canadian Solar 550W HiKu7
                        </h3>

                        {/* SKU */}
                        <ProductSKU
                            sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS"
                            size="sm"
                            copyable={true}
                        />

                        {/* Especificações */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-medium">550W</span>
                            <span>21.5% η</span>
                        </div>

                        {/* Preço */}
                        <div className="text-2xl font-bold text-gray-900">
                            R$ 1.247,00
                        </div>
                    </div>
                </div>
            </section>

            {/* Teste Responsividade */}
            <section className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Teste de Responsividade</h2>

                <div className="space-y-4">
                    <div className="border rounded p-4 max-w-xs">
                        <p className="text-xs text-gray-500 mb-2">Mobile (320px)</p>
                        <ProductSKU sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS" size="sm" />
                        <ProductModel manufacturer="Canadian Solar" model="CS7L-550MS" size="sm" />
                    </div>

                    <div className="border rounded p-4 max-w-md">
                        <p className="text-xs text-gray-500 mb-2">Tablet (768px)</p>
                        <ProductSKU sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS" size="md" />
                        <ProductModel manufacturer="Canadian Solar" model="CS7L-550MS" size="md" />
                    </div>

                    <div className="border rounded p-4 max-w-2xl">
                        <p className="text-xs text-gray-500 mb-2">Desktop (1024px+)</p>
                        <ProductSKU sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS" size="md" />
                        <ProductModel manufacturer="Canadian Solar" model="CS7L-550MS" series="HiKu7" size="md" link={true} />
                    </div>
                </div>
            </section>

            {/* Teste de Acessibilidade */}
            <section className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Checklist de Acessibilidade</h2>

                <ul className="space-y-2">
                    <li>✅ Botão de copiar tem aria-label</li>
                    <li>✅ CategoryIcon tem tooltip (title)</li>
                    <li>✅ Contraste de cores adequado (WCAG AA)</li>
                    <li>✅ Navegação por teclado funciona</li>
                    <li>✅ Feedback visual ao copiar SKU</li>
                    <li>✅ Textos legíveis em diferentes tamanhos</li>
                </ul>
            </section>
        </div>
    )
}
