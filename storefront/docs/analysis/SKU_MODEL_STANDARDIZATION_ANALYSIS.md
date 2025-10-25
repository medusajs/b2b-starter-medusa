# Análise de Padronização: SKUs e Modelos - Storefront YSH

**Data:** 7 de Outubro de 2025  
**Escopo:** Revisão completa da padronização de SKUs e Models no storefront

---

## 📋 Situação Atual

### 1. Campos de Produto Identificados

#### No ProductCard (Catálogo)

```typescript
interface ProductCardProps {
    product: {
        id: string           // Identificador único
        name: string         // Nome completo do produto
        sku?: string         // SKU opcional (variante)
        manufacturer?: string // Fabricante
        model?: string       // Modelo do produto
        // ... outros campos
    }
}
```

#### Na Product Variants Table (Medusa)

```typescript
{
    variant: {
        sku: string         // SKU da variante (obrigatório)
        options: []         // Opções da variante
    }
}
```

#### No Backend (Normalização)

```typescript
{
    id: string,            // ID único (geralmente baseado no SKU)
    sku: string,           // SKU do produto
    name: string,          // Nome do produto
    manufacturer: string,  // Fabricante
    model?: string,        // Modelo
    // ...
}
```

---

## 🔍 Problemas Identificados

### 1. **Inconsistência na Exibição de SKU**

**Problema:** O SKU aparece em contextos diferentes:

- ✅ Na tabela de variantes (sempre exibido)
- ❌ No ProductCard (opcional, raramente exibido)
- ⚠️ No backend (usado como ID principal)

**Exemplo:**

```tsx
// ProductCard.tsx - SKU não é exibido visualmente
{product.manufacturer && (
    <p className="text-xs text-gray-500 uppercase tracking-wide">
        {product.manufacturer}
    </p>
)}
{product.model && (
    <p className="text-sm text-gray-600 font-medium">
        {product.model}
    </p>
)}
// SKU não aparece aqui ❌
```

**Vs.**

```tsx
// product-variants-table/index.tsx - SKU exibido
<Table.HeaderCell className="px-4">SKU</Table.HeaderCell>
<Table.Cell className="px-4">{variant.sku}</Table.Cell>
```

### 2. **Duplicação: Model vs Name**

**Problema:** Confusão entre `model` e `name`:

```typescript
// Alguns produtos têm:
{
    name: "Painel Solar 550W Monocristalino PERC",
    model: "CS7L-550MS",
    manufacturer: "Canadian Solar"
}

// Outros têm tudo no nome:
{
    name: "Canadian Solar CS7L-550MS 550W Monocristalino PERC",
    model: undefined,
    manufacturer: "Canadian Solar"
}
```

### 3. **SKU vs ID Inconsistência**

**Problema:** Backend usa SKU como ID, mas nem sempre são os mesmos:

```typescript
// backend/src/api/store/catalog/search/route.ts
const base: any = {
    id: raw.id || raw.sku,  // ⚠️ Pode ser diferente
    sku: raw.sku,
    // ...
}
```

### 4. **Falta de Padrão Visual**

Atualmente, não há um formato visual consistente para exibir:

- SKU do produto
- Modelo do fabricante
- Código de referência

---

## ✅ Recomendações de Padronização

### 1. **Estrutura de Dados Padronizada**

```typescript
interface StandardizedProduct {
    // Identificadores
    id: string                    // ID único do sistema (nunca muda)
    sku: string                   // SKU comercial (pode ser do fabricante ou distribuidor)
    internal_sku?: string         // SKU interno YSH (se diferente)
    
    // Informações do Produto
    name: string                  // Nome descritivo completo
    manufacturer: string          // Fabricante (ex: "Canadian Solar", "Growatt")
    model: string                 // Modelo do fabricante (ex: "CS7L-550MS", "MID-25KTL3-X")
    series?: string               // Série do produto (ex: "HiKu7", "TopHiKu")
    
    // Classificação
    category: string              // Categoria principal
    subcategory?: string          // Subcategoria específica
    
    // Pricing & Availability
    price_brl: number
    availability: boolean
    
    // Metadata
    metadata: {
        original_sku?: string     // SKU original do distribuidor
        distributor: string       // Fonte do produto
        last_updated: string
    }
}
```

### 2. **Padrão de Exibição Visual**

#### ProductCard (Catálogo)

```tsx
<div className="product-card">
    {/* Cabeçalho */}
    <div className="product-header">
        <span className="manufacturer">{manufacturer}</span>
        <span className="model">{model}</span>
    </div>
    
    {/* Nome do Produto */}
    <h3 className="product-name">{name}</h3>
    
    {/* SKU (sempre visível) */}
    <div className="product-sku">
        <span className="label">SKU:</span>
        <span className="value">{sku}</span>
    </div>
    
    {/* Especificações */}
    <div className="product-specs">
        {/* specs aqui */}
    </div>
</div>
```

#### Product Detail Page

```tsx
<div className="product-detail-header">
    <div className="breadcrumb">
        {category} > {subcategory} > {manufacturer}
    </div>
    
    <h1 className="product-title">
        {manufacturer} {model} - {name}
    </h1>
    
    <div className="product-identifiers">
        <div className="identifier-group">
            <label>SKU:</label>
            <code>{sku}</code>
            <button onClick={copyToClipboard}>📋</button>
        </div>
        
        {internal_sku && (
            <div className="identifier-group">
                <label>Ref. Interna:</label>
                <code>{internal_sku}</code>
            </div>
        )}
        
        <div className="identifier-group">
            <label>Modelo:</label>
            <span>{model}</span>
        </div>
    </div>
</div>
```

### 3. **Convenção de Nomenclatura**

#### Para SKUs

```
Formato: [DISTRIBUTOR]-[CATEGORY]-[MANUFACTURER]-[MODEL]-[VARIANT]

Exemplos:
- NEOSOLAR-PANEL-CANADIAN-CS7L550MS-MONO
- FOTUS-KIT-CANADIAN-5KWP-CERAMIC
- SOLFACIL-INV-GROWATT-MID25KTL3X-TRI
```

#### Para Models

```
Formato: Usar exatamente como especificado pelo fabricante

Exemplos corretos:
✅ CS7L-550MS (Canadian Solar)
✅ MID-25KTL3-X (Growatt)
✅ SUN-5K-G03 (Deye)

Exemplos incorretos:
❌ cs7l550ms (sem formatação)
❌ CS7L 550MS (espaçamento errado)
❌ Canadian Solar 550W (não é o modelo)
```

### 4. **Migração e Normalização**

#### Script de Normalização de SKUs

```python
def normalize_sku(raw_sku: str, category: str, manufacturer: str, model: str) -> str:
    """
    Normaliza SKU para o padrão YSH
    """
    # Remover caracteres especiais
    clean_sku = re.sub(r'[^A-Z0-9\-]', '', raw_sku.upper())
    
    # Se já está no formato correto, retornar
    if clean_sku.count('-') >= 3:
        return clean_sku
    
    # Construir SKU padronizado
    category_code = CATEGORY_CODES.get(category, 'PROD')
    manufacturer_code = MANUFACTURER_CODES.get(manufacturer, manufacturer[:4].upper())
    model_code = model.replace(' ', '-').upper()
    
    return f"YSH-{category_code}-{manufacturer_code}-{model_code}"

# Exemplo de uso:
# Input: "FOTUS-KP-113kWp-Ceramico-kits"
# Output: "YSH-KIT-FOTUS-113KWP-CERAMIC"
```

### 5. **Componentes React Padronizados**

#### ProductSKU Component

```tsx
interface ProductSKUProps {
    sku: string
    internal_sku?: string
    copyable?: boolean
    size?: 'sm' | 'md' | 'lg'
}

const ProductSKU = ({ sku, internal_sku, copyable = true, size = 'md' }: ProductSKUProps) => {
    const [copied, setCopied] = useState(false)
    
    const handleCopy = () => {
        navigator.clipboard.writeText(sku)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    
    return (
        <div className={`product-sku product-sku-${size}`}>
            <span className="sku-label">SKU:</span>
            <code className="sku-value">{sku}</code>
            {copyable && (
                <button 
                    onClick={handleCopy}
                    className="sku-copy-btn"
                    title="Copiar SKU"
                >
                    {copied ? '✓' : '📋'}
                </button>
            )}
            {internal_sku && (
                <span className="sku-internal" title="Referência Interna">
                    (Ref: {internal_sku})
                </span>
            )}
        </div>
    )
}
```

#### ProductModel Component

```tsx
interface ProductModelProps {
    manufacturer: string
    model: string
    series?: string
    link?: boolean
}

const ProductModel = ({ manufacturer, model, series, link = false }: ProductModelProps) => {
    const content = (
        <div className="product-model">
            <span className="manufacturer">{manufacturer}</span>
            <span className="model-separator">›</span>
            <span className="model-code">{model}</span>
            {series && (
                <>
                    <span className="model-separator">•</span>
                    <span className="model-series">{series}</span>
                </>
            )}
        </div>
    )
    
    if (link) {
        return (
            <Link href={`/produtos?manufacturer=${manufacturer}&model=${model}`}>
                {content}
            </Link>
        )
    }
    
    return content
}
```

---

## 🎯 Plano de Implementação

### Fase 1: Backend (1-2 dias)

1. ✅ Criar script de normalização de SKUs
2. ✅ Atualizar schemas com campos padronizados
3. ✅ Migrar dados existentes
4. ✅ Validar integridade dos dados

### Fase 2: API (1 dia)

1. ✅ Garantir que API sempre retorna `sku`, `model`, `manufacturer`
2. ✅ Adicionar endpoint de busca por SKU
3. ✅ Documentar estrutura de dados

### Fase 3: Componentes UI (2-3 dias)

1. ✅ Criar `ProductSKU` component
2. ✅ Criar `ProductModel` component
3. ✅ Atualizar `ProductCard` para exibir SKU
4. ✅ Atualizar product detail pages
5. ✅ Adicionar estilos CSS

### Fase 4: Testing & QA (1 dia)

1. ✅ Testar exibição em diferentes categorias
2. ✅ Validar funcionalidade de copiar SKU
3. ✅ Testar busca por SKU
4. ✅ Revisar acessibilidade

---

## 📊 Métricas de Sucesso

- ✅ 100% dos produtos têm SKU único e válido
- ✅ 100% dos produtos exibem SKU de forma consistente
- ✅ Model e Manufacturer sempre preenchidos quando disponíveis
- ✅ Zero ambiguidade entre ID, SKU e Model
- ✅ Busca por SKU funciona em todos os contextos

---

## 🔧 Arquivos a Modificar

### Storefront

```
storefront/src/modules/catalog/components/
├── ProductCard.tsx                    # ✅ Adicionar exibição de SKU
├── ProductSKU.tsx                     # ✅ CRIAR - Novo componente
├── ProductModel.tsx                   # ✅ CRIAR - Novo componente
└── EnrichedProductCard.tsx            # ✅ Atualizar para usar novos componentes

storefront/src/modules/products/
├── templates/product-info/index.tsx   # ✅ Adicionar SKU e Model
└── components/product-variants-table/ # ✅ Já exibe SKU corretamente

storefront/src/lib/api/
├── fallback.ts                        # ✅ Garantir normalização
└── validation.ts                      # ✅ Adicionar validação de SKU
```

### Backend

```
backend/src/api/store/
├── catalog/search/route.ts            # ✅ Normalizar SKU na resposta
└── products.custom/[id]/route.ts      # ✅ Garantir campos obrigatórios

backend/src/scripts/
└── normalize-product-skus.ts          # ✅ CRIAR - Script de normalização
```

---

## 📝 Observações Importantes

### Compatibilidade com Medusa

- Medusa usa `variant.sku` para variantes
- Produto base pode ter `sku` ou usar `id`
- Nossa implementação deve manter compatibilidade

### Distribuidores

- Cada distribuidor tem seu próprio formato de SKU
- Precisamos mapear e normalizar internamente
- Manter referência ao SKU original em metadata

### Busca e Filtros

- Busca deve funcionar por SKU normalizado E original
- Filtros devem permitir busca por fabricante + modelo
- Suporte a busca fuzzy para modelos similares

---

## ✨ Benefícios da Padronização

1. **Experiência do Usuário**
   - Facilita busca e comparação de produtos
   - SKU sempre visível e copiável
   - Modelo do fabricante claramente identificado

2. **Operacional**
   - Integração mais fácil com distribuidores
   - Menos erros em pedidos
   - Melhor rastreabilidade

3. **Técnico**
   - Código mais limpo e manutenível
   - Menos bugs relacionados a identificação
   - API mais previsível

4. **Negócio**
   - Melhor SEO (structured data)
   - Facilita analytics
   - Suporte ao cliente mais eficiente

---

**Status:** 📋 Análise completa  
**Próximo passo:** Implementar Fase 1 (Backend)
