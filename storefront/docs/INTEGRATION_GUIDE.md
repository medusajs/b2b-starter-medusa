# GUIA DE INTEGRAÇÃO TÉCNICA - YSH Store

## 🎯 Visão Geral

Este guia documenta as personalizações implementadas no storefront B2B da Yello Solar Hub, baseado no template Medusa.js B2B Starter.

## 📦 Componentes Criados

### 1. Home Page Components

#### `SolutionsByClass` (`/modules/home/components/solutions-by-class/index.tsx`)

- **Propósito**: Cards clicáveis por classe consumidora (B1/B2/B3/Condomínios/Indústria)
- **Analytics**: Dispara evento `solutions_class_clicked`
- **Navegação**: Redireciona para `/solucoes?classe={id}`

#### `ModalidadesGrid` (`/modules/home/components/modalidades-grid/index.tsx`)

- **Propósito**: Grid de modalidades energéticas (on-grid, híbrido, off-grid, EaaS/PPA)
- **Benefícios**: Lista de benefícios por modalidade
- **Navegação**: Redireciona para `/produtos?modalidade={id}`

### 2. Soluções Page (`/app/[countryCode]/(main)/solucoes/page.tsx`)

- **Template**: `/modules/solucoes/templates/index.tsx`
- **Filtros**: Cliente-side por classe consumidora e modalidade
- **Estado**: Gerenciado via React useState
- **Próximo**: Integrar com Medusa Products API usando collections/tags

### 3. Contextos

#### `SalesChannelContext` (`/lib/context/sales-channel-context.tsx`)

- **Estados**:
  - `channel`: "ysh-b2b" | "ysh-b2c"
  - `customerGroup`: CustomerGroup | null
- **Helpers**:
  - `isB2B`, `isB2C`
  - `canAccessBulkOrder`, `canAccessQuotes`, `canAccessApprovals`
  - `priceListId`: Retorna price list aplicável por grupo

**Uso**:

```tsx
const { isB2B, customerGroup, priceListId } = useSalesChannel()
```

### 4. ProductCard Enhancements (`/modules/catalog/components/ProductCard.tsx`)

**Novos campos**:

```typescript
{
  modalidade?: string // "on-grid" | "hibrido" | "off-grid" | "eaas" | "ppa"
  classe_consumidora?: string[] // ["residencial-b1", "comercial-b3"]
  roi_estimado?: number // em anos
}
```

**Badges adicionados**:

- Modalidade (azul)
- ROI estimado (verde)
- Classes consumidoras (cinza, abaixo das specs)

## 📊 Analytics Events

Eventos implementados em `/modules/analytics/events.ts`:

| Evento | Payload | Gatilho |
|--------|---------|---------|
| `quote_requested` | `{ company_id, items[], est_value, group_id }` | Solicitação de cotação |
| `quote_approved` | `{ approver_id, quote_id, policy }` | Aprovação de cotação |
| `company_invite_sent` | `{ company_id, email, role }` | Convite de funcionário |
| `bulk_add_completed` | `{ skus[], count, list_id }` | Bulk order completado |
| `price_list_applied` | `{ price_list_id, group_id, channel }` | Price list aplicada |
| `checkout_step_viewed` | `{ step_name }` | Visualização de step do checkout |
| `payment_selected` | `{ method }` | Método de pagamento escolhido |
| `order_placed` | `{ order_id, value, channel }` | Pedido confirmado |

**Como usar**:

```typescript
import { trackQuoteRequested } from "@/modules/analytics/events"

trackQuoteRequested({ 
  company_id: "123", 
  items: [...], 
  est_value: 50000,
  group_id: "comercial-b3"
})
```

## 🔌 Integrações Medusa Pendentes

### 1. Customer Groups

Criar via Medusa Admin:

- `residencial-b1`
- `rural-b2`
- `comercial-b3`
- `condominios`
- `integradores`
- `industria`

### 2. Price Lists

Criar via Medusa Admin (ver `docs/policies/pricing_channels_groups.md`):

- `b2b-integradores-2025q4` → customer_groups: [integradores]
- `b2b-pme-patamar1` → customer_groups: [comercial-b3, rural-b2]
- `residencial-promo` → customer_groups: [residencial-b1]

### 3. Sales Channels

- `ysh-b2b`: Catálogo B2B, acesso autenticado
- `ysh-b2c`: Catálogo simplificado, público

### 4. Product Metadata

Adicionar metadata aos produtos via Medusa Admin:

```json
{
  "modalidade": "on-grid",
  "classe_consumidora": ["residencial-b1", "comercial-b3"],
  "roi_estimado": 4
}
```

### 5. Collections/Tags

Criar collections por:

- Modalidade: "On-Grid", "Híbrido", "Off-Grid"
- Classe: "Residencial B1", "Comercial B3", etc.

## 🎨 Design Tokens (Tailwind Classes)

Já existentes no projeto:

- `.ysh-btn-primary`: Botão primário (amarelo)
- `.ysh-btn-outline`: Botão outline
- `.ysh-product-card`: Card de produto
- `.ysh-badge-tier-*`: Badges de tier (XPP, PP, P, M, G)

## ✅ Checklist de Integração

### Backend (Medusa Admin)

- [ ] Criar Customer Groups (6 grupos)
- [ ] Criar Sales Channels (2 canais)
- [ ] Criar Price Lists (3 iniciais)
- [ ] Adicionar metadata aos produtos
- [ ] Criar collections por modalidade e classe
- [ ] Configurar permissões de acesso por canal

### Frontend (Storefront)

- [x] Componentes de home personalizados
- [x] Página /solucoes com filtros
- [x] Context de Sales Channel
- [x] Events de analytics
- [x] ProductCard com badges YSH
- [ ] Integrar filtros com Medusa API
- [ ] Aplicar price lists dinâmicos
- [ ] Restringir catálogo por canal
- [ ] Bulk order com CSV upload
- [ ] Modal de cotação com aprovação

### Analytics

- [ ] Configurar Google Tag Manager
- [ ] Criar dashboard no GA4 para funil cotação→pedido
- [ ] Configurar metas de conversão
- [ ] Habilitar e-commerce tracking

## 🚀 Próximos Passos

1. **Integrar contexto SalesChannelContext no layout raiz**
2. **Criar loader para detectar customer group do usuário logado**
3. **Implementar filtros dinâmicos em /solucoes conectando com Medusa**
4. **Criar modal de cotação reutilizável**
5. **Implementar fluxo de aprovação de cotações**
6. **Adicionar bulk order component**

## 📚 Referências

- [Documentação Medusa.js](https://docs.medusajs.com)
- [B2B Starter Guide](https://github.com/medusajs/b2b-starter-medusa)
- Arquitetura de Informação: `/docs/IA_YSH_Store.md`
- Políticas: `/docs/policies/pricing_channels_groups.md`
- Eventos: `/docs/analytics/events.json`
