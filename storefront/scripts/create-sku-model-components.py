"""
Script para criar componentes padronizados de SKU e Model
Parte do plano de padronização YSH
"""

import os
from pathlib import Path

# Diretório base do storefront
STOREFRONT_DIR = Path(r"c:\Users\fjuni\ysh_medusa\ysh-store\storefront\src\modules")

# Componente ProductSKU
PRODUCT_SKU_COMPONENT = '''import { useState } from "react"
import { clx } from "@medusajs/ui"

interface ProductSKUProps {
    sku: string
    internal_sku?: string
    copyable?: boolean
    size?: "sm" | "md" | "lg"
    className?: string
}

export const ProductSKU = ({
    sku,
    internal_sku,
    copyable = true,
    size = "md",
    className
}: ProductSKUProps) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(sku)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy SKU:", err)
        }
    }

    const sizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
    }

    return (
        <div className={clx(
            "flex items-center gap-2 font-mono",
            sizeClasses[size],
            className
        )}>
            <span className="text-gray-500">SKU:</span>
            <code className="px-2 py-1 bg-gray-100 rounded text-gray-900">
                {sku}
            </code>
            {copyable && (
                <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title={copied ? "Copiado!" : "Copiar SKU"}
                    aria-label="Copiar SKU"
                >
                    {copied ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            )}
            {internal_sku && (
                <span className="text-xs text-gray-400" title="Referência Interna">
                    (Ref: {internal_sku})
                </span>
            )}
        </div>
    )
}

export default ProductSKU
'''

# Componente ProductModel
PRODUCT_MODEL_COMPONENT = '''import Link from "next/link"
import { clx } from "@medusajs/ui"

interface ProductModelProps {
    manufacturer: string
    model: string
    series?: string
    link?: boolean
    size?: "sm" | "md" | "lg"
    className?: string
}

export const ProductModel = ({
    manufacturer,
    model,
    series,
    link = false,
    size = "md",
    className
}: ProductModelProps) => {
    const sizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
    }

    const content = (
        <div className={clx(
            "flex items-center gap-1.5 font-medium",
            sizeClasses[size],
            className
        )}>
            <span className="text-gray-700">{manufacturer}</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-semibold">{model}</span>
            {series && (
                <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 text-xs">{series}</span>
                </>
            )}
        </div>
    )

    if (link) {
        return (
            <Link
                href={`/produtos?manufacturer=${encodeURIComponent(manufacturer)}&model=${encodeURIComponent(model)}`}
                className="hover:text-blue-600 transition-colors"
            >
                {content}
            </Link>
        )
    }

    return content
}

export default ProductModel
'''

# Index para exportar os componentes
INDEX_FILE = '''export { ProductSKU } from "./ProductSKU"
export { ProductModel } from "./ProductModel"
'''

def create_component_files():
    """Cria os arquivos dos componentes"""
    
    # Criar diretório catalog/components/product-identifiers
    component_dir = STOREFRONT_DIR / "catalog" / "components" / "product-identifiers"
    component_dir.mkdir(parents=True, exist_ok=True)
    
    # Criar ProductSKU.tsx
    sku_file = component_dir / "ProductSKU.tsx"
    with open(sku_file, "w", encoding="utf-8") as f:
        f.write(PRODUCT_SKU_COMPONENT)
    print(f"✅ Criado: {sku_file}")
    
    # Criar ProductModel.tsx
    model_file = component_dir / "ProductModel.tsx"
    with open(model_file, "w", encoding="utf-8") as f:
        f.write(PRODUCT_MODEL_COMPONENT)
    print(f"✅ Criado: {model_file}")
    
    # Criar index.ts
    index_file = component_dir / "index.ts"
    with open(index_file, "w", encoding="utf-8") as f:
        f.write(INDEX_FILE)
    print(f"✅ Criado: {index_file}")

def create_css_styles():
    """Cria arquivo CSS com estilos para os componentes"""
    
    css_content = '''/* Product Identifiers Styles */

.product-sku {
    @apply flex items-center gap-2 font-mono;
}

.product-sku.product-sku-sm {
    @apply text-xs;
}

.product-sku.product-sku-md {
    @apply text-sm;
}

.product-sku.product-sku-lg {
    @apply text-base;
}

.sku-label {
    @apply text-gray-500 font-normal;
}

.sku-value {
    @apply px-2 py-1 bg-gray-100 rounded text-gray-900 select-all;
}

.sku-copy-btn {
    @apply p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer;
}

.sku-copy-btn:active {
    @apply scale-95;
}

.sku-internal {
    @apply text-xs text-gray-400;
}

/* Product Model Styles */

.product-model {
    @apply flex items-center gap-1.5 font-medium;
}

.product-model .manufacturer {
    @apply text-gray-700;
}

.product-model .model-separator {
    @apply text-gray-400;
}

.product-model .model-code {
    @apply text-gray-900 font-semibold;
}

.product-model .model-series {
    @apply text-gray-600 text-xs;
}

/* Product Card Enhancements */

.product-card .product-identifiers {
    @apply flex flex-col gap-2 mt-2 p-3 bg-gray-50 rounded-lg;
}

.product-card .product-identifiers .identifier-group {
    @apply flex items-center gap-2;
}

.product-card .product-identifiers .identifier-group label {
    @apply text-xs text-gray-500 font-medium uppercase;
}

/* Product Detail Page Identifiers */

.product-detail-identifiers {
    @apply grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg;
}

.product-detail-identifiers .identifier-group {
    @apply flex flex-col gap-1;
}

.product-detail-identifiers .identifier-group label {
    @apply text-xs text-gray-500 font-medium uppercase;
}

.product-detail-identifiers .identifier-group code {
    @apply text-sm font-mono px-2 py-1 bg-white rounded border border-gray-200;
}
'''
    
    css_file = STOREFRONT_DIR / ".." / "styles" / "product-identifiers.css"
    css_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(css_file, "w", encoding="utf-8") as f:
        f.write(css_content)
    print(f"✅ Criado: {css_file}")

def create_readme():
    """Cria README para os componentes"""
    
    readme_content = '''# Product Identifiers Components

Componentes padronizados para exibição de SKUs e Modelos de produtos.

## Componentes

### ProductSKU

Exibe o SKU de um produto com funcionalidade de copiar.

**Props:**
- `sku` (string, required): SKU do produto
- `internal_sku` (string, optional): SKU interno YSH
- `copyable` (boolean, optional): Habilita botão de copiar (default: true)
- `size` ("sm" | "md" | "lg", optional): Tamanho do componente (default: "md")
- `className` (string, optional): Classes CSS adicionais

**Exemplo:**
```tsx
import { ProductSKU } from "@/modules/catalog/components/product-identifiers"

<ProductSKU 
    sku="NEOSOLAR-PANEL-CANADIAN-CS7L550MS" 
    internal_sku="YSH-001234"
    size="md"
    copyable={true}
/>
```

### ProductModel

Exibe fabricante e modelo de forma padronizada.

**Props:**
- `manufacturer` (string, required): Nome do fabricante
- `model` (string, required): Modelo do produto
- `series` (string, optional): Série do produto
- `link` (boolean, optional): Transforma em link de busca (default: false)
- `size` ("sm" | "md" | "lg", optional): Tamanho (default: "md")
- `className` (string, optional): Classes CSS adicionais

**Exemplo:**
```tsx
import { ProductModel } from "@/modules/catalog/components/product-identifiers"

<ProductModel 
    manufacturer="Canadian Solar"
    model="CS7L-550MS"
    series="HiKu7"
    link={true}
/>
```

## Uso nos Cards

```tsx
import { ProductSKU, ProductModel } from "@/modules/catalog/components/product-identifiers"

<div className="product-card">
    <ProductModel 
        manufacturer={product.manufacturer}
        model={product.model}
        size="sm"
    />
    
    <h3>{product.name}</h3>
    
    <ProductSKU 
        sku={product.sku}
        size="sm"
    />
</div>
```

## Estilos

Os componentes vêm com estilos padrão. Para customizar, adicione classes CSS:

```tsx
<ProductSKU 
    sku="..." 
    className="my-custom-class"
/>
```

Ou use as classes Tailwind diretamente.
'''
    
    readme_file = STOREFRONT_DIR / "catalog" / "components" / "product-identifiers" / "README.md"
    with open(readme_file, "w", encoding="utf-8") as f:
        f.write(readme_content)
    print(f"✅ Criado: {readme_file}")

def main():
    """Função principal"""
    print("=" * 60)
    print("CRIAÇÃO DE COMPONENTES PADRONIZADOS - SKU E MODEL")
    print("=" * 60)
    print()
    
    try:
        create_component_files()
        print()
        create_css_styles()
        print()
        create_readme()
        
        print()
        print("=" * 60)
        print("✅ COMPONENTES CRIADOS COM SUCESSO!")
        print("=" * 60)
        print()
        print("📂 Arquivos criados:")
        print("  - storefront/src/modules/catalog/components/product-identifiers/ProductSKU.tsx")
        print("  - storefront/src/modules/catalog/components/product-identifiers/ProductModel.tsx")
        print("  - storefront/src/modules/catalog/components/product-identifiers/index.ts")
        print("  - storefront/src/modules/catalog/components/product-identifiers/README.md")
        print("  - storefront/src/styles/product-identifiers.css")
        print()
        print("📝 Próximos passos:")
        print("  1. Importar o CSS no layout principal")
        print("  2. Atualizar ProductCard.tsx para usar os novos componentes")
        print("  3. Atualizar product detail pages")
        print("  4. Testar em diferentes tamanhos de tela")
        print()
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        raise

if __name__ == "__main__":
    main()
