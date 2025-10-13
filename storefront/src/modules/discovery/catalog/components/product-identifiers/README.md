# Product Identifiers Components

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
