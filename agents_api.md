# YSH B2B API Reference

## Visão Geral

Documentação completa das APIs do Yello Solar Hub, incluindo módulos customizados B2B (Company, Quote, Approval) e APIs padrão do Medusa.

---

# Módulos B2B Customizados

## Company Module

### Visão Geral

Gerencia empresas B2B e seus funcionários, incluindo validação de CNPJ, limites de gastos e importação/exportação em massa.

### Store API

#### Listar Empresas

- **Endpoint**: `GET /store/companies`
- **Descrição**: Lista empresas ativas
- **Autenticação**: Publishable API key
- **Query Params**: `limit`, `offset`, `fields`

#### Obter Empresa por ID

- **Endpoint**: `GET /store/companies/{id}`
- **Descrição**: Detalhes de uma empresa específica
- **Autenticação**: Publishable API key

#### Obter Funcionário por Customer ID

- **Endpoint**: `GET /store/companies/employee/by-customer/{customerId}`
- **Descrição**: Recupera funcionário vinculado a um customer
- **Autenticação**: JWT token

### Admin API

#### Criar Empresa

- **Endpoint**: `POST /admin/companies`
- **Autenticação**: JWT token
- **Body**:

```typescript
{
  name: string;
  cnpj: string;           // Validado (14 dígitos)
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;       // Default: "BR"
  currency_code?: string; // Default: "BRL"
  tax_id?: string;
  logo_url?: string;
  spending_limit?: number;
  is_active?: boolean;    // Default: true
}
```

#### Atualizar Empresa

- **Endpoint**: `POST /admin/companies/{id}`
- **Autenticação**: JWT token

#### Deletar Empresa (Soft Delete)

- **Endpoint**: `DELETE /admin/companies/{id}`
- **Descrição**: Marca empresa como inativa

#### Criar Funcionário

- **Endpoint**: `POST /admin/companies/{companyId}/employees`
- **Body**:

```typescript
{
  customer_id: string;
  company_id: string;
  is_admin: boolean;
  role: string;           // "admin" | "buyer" | "viewer"
  spending_limit?: number;
  is_active?: boolean;
}
```

#### Importar Empresas (CSV)

- **Endpoint**: `POST /admin/companies/import`
- **Content-Type**: `text/csv`
- **Descrição**: Importação em massa via CSV

#### Exportar Empresas (CSV)

- **Endpoint**: `GET /admin/companies/export`
- **Query**: `?filters[name]=...`
- **Response**: CSV file

### Tipos

```typescript
interface CompanyDTO {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  email_domain: string;   // Auto-extraído
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  currency_code: string;
  spending_limit?: number;
  is_active: boolean;
  employees?: EmployeeDTO[];
  created_at: Date;
  updated_at: Date;
}

interface EmployeeDTO {
  id: string;
  customer_id: string;
  company_id: string;
  is_admin: boolean;
  role: string;
  spending_limit?: number;
  is_active: boolean;
  company?: CompanyDTO;
}
```

### Validações

- **CNPJ**: 14 dígitos, validação de dígitos verificadores
- **Email Domain**: Auto-extraído e normalizado
- **Spending Limit**: Verificado antes de checkout

### Eventos

- `company.created`
- `company.updated`
- `employee.created`
- `employee.spending_limit_exceeded`

---

## Quote Module

### Visão Geral

Sistema de cotações B2B com mensagens, negociação e conversão para pedidos.

### Store API

#### Criar Cotação

- **Endpoint**: `POST /store/quotes`
- **Autenticação**: JWT token
- **Body**:

```typescript
{
  cart_id?: string;
  items: {
    variant_id: string;
    quantity: number;
  }[];
  notes?: string;
}
```

#### Listar Cotações

- **Endpoint**: `GET /store/quotes`
- **Query**: `status`, `limit`, `offset`

#### Obter Cotação

- **Endpoint**: `GET /store/quotes/{id}`
- **Relations**: `messages`, `items`

#### Enviar Mensagem

- **Endpoint**: `POST /store/quotes/{id}/messages`
- **Body**:

```typescript
{
  content: string;
  attachments?: string[];
}
```

#### Aceitar Cotação

- **Endpoint**: `POST /store/quotes/{id}/accept`
- **Descrição**: Converte cotação em pedido

#### Rejeitar Cotação

- **Endpoint**: `POST /store/quotes/{id}/reject`
- **Body**: `{ reason?: string }`

### Admin API

#### Atualizar Cotação

- **Endpoint**: `POST /admin/quotes/{id}`
- **Body**:

```typescript
{
  status?: "draft" | "pending" | "accepted" | "rejected";
  items?: {
    variant_id: string;
    quantity: number;
    unit_price?: number;
  }[];
  discount_total?: number;
  notes?: string;
}
```

#### Enviar Mensagem (Admin)

- **Endpoint**: `POST /admin/quotes/{id}/messages`

### Tipos

```typescript
interface QuoteDTO {
  id: string;
  customer_id: string;
  status: "draft" | "pending" | "accepted" | "rejected";
  items: QuoteItemDTO[];
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  notes?: string;
  messages?: MessageDTO[];
  created_at: Date;
  updated_at: Date;
}

interface MessageDTO {
  id: string;
  quote_id: string;
  sender_id: string;
  sender_type: "customer" | "admin";
  content: string;
  attachments?: string[];
  created_at: Date;
}
```

### Workflows

- `create-quote-workflow`: Cria cotação a partir de carrinho
- `accept-quote-workflow`: Converte cotação em pedido
- `reject-quote-workflow`: Rejeita cotação com motivo

---

## Approval Module

### Visão Geral

Sistema de aprovações para carrinhos B2B com regras configuráveis, histórico de auditoria e escalação automática.

### Store API

#### Listar Aprovações Pendentes

- **Endpoint**: `GET /store/approvals`
- **Query**: `status=pending`
- **Autenticação**: JWT token

#### Obter Aprovação

- **Endpoint**: `GET /store/approvals/{id}`

#### Aprovar Carrinho

- **Endpoint**: `POST /store/approvals/{id}/approve`
- **Body**: `{ comment?: string }`

#### Rejeitar Carrinho

- **Endpoint**: `POST /store/approvals/{id}/reject`
- **Body**:

```typescript
{
  reason: string;
  comment?: string;
}
```

### Admin API

#### Configurar Regras de Aprovação

- **Endpoint**: `POST /admin/approvals/rules`
- **Body**:

```typescript
{
  company_id: string;
  name: string;
  required_approval_type: "company_admin" | "merchant" | "finance";
  required_approvers_count: number;
  priority: number;
  conditions: {
    cart_total_gte?: number;
    cart_total_lte?: number;
    item_count_gte?: number;
    day_of_week?: string[];
  };
  effective_from?: Date;
  effective_until?: Date;
  is_active: boolean;
}
```

#### Listar Regras

- **Endpoint**: `GET /admin/approvals/rules`
- **Query**: `company_id`, `is_active`

#### Configurar Settings de Empresa

- **Endpoint**: `POST /admin/approvals/settings`
- **Body**:

```typescript
{
  company_id: string;
  require_approval: boolean;
  approval_threshold?: number;
  auto_approve_below?: number;
  escalation_enabled: boolean;
  escalation_timeout_hours: number;
  notification_emails?: string[];
}
```

#### Histórico de Aprovações (Audit Trail)

- **Endpoint**: `GET /admin/approvals/{id}/history`
- **Descrição**: Histórico imutável de mudanças de status

### Tipos

```typescript
interface ApprovalDTO {
  id: string;
  cart_id: string;
  type: "company_admin" | "merchant" | "finance";
  status: "pending" | "approved" | "rejected";
  created_by: string;
  handled_by?: string;
  handled_at?: Date;
  rejection_reason?: string;
  cart_total_snapshot?: number;
  priority: number;
  escalated: boolean;
  idempotency_key: string;
}

interface ApprovalHistoryDTO {
  id: string;
  approval_id: string;
  previous_status: string | null;
  new_status: string;
  actor_id: string;
  actor_role: string;
  actor_ip_hash?: string;        // SHA-256 hash
  actor_user_agent_hash?: string; // SHA-256 hash
  reason?: string;
  comment?: string;
  cart_total_at_action?: number;
  action_timestamp: Date;
  is_escalation: boolean;
  is_system_action: boolean;
}
```

### Workflows

- `evaluate-approval-rules-workflow`: Avalia regras e cria aprovações necessárias
- `approve-cart-workflow`: Processa aprovação de carrinho
- `escalate-approval-workflow`: Escalação automática após timeout

### Segurança

- **Idempotência**: Chave única por `cart_id` + `type`
- **Audit Trail**: Histórico imutável com hashes de IP/User-Agent
- **Escalação**: Timeout configurável por empresa

---

# APIs Padrão Medusa

## Product Tags API

### Visão Geral

A API de Product Tags do Medusa permite gerenciar tags de produtos na loja. As tags são usadas para categorizar e organizar produtos, facilitando a navegação e busca.

## Endpoints da API

### Store API (Frontend)

#### Listar Product Tags (Store)

- **Endpoint**: `GET /store/product-tags`
- **Descrição**: Recupera uma lista paginada de tags de produtos
- **Autenticação**: Não requerida (usa publishable API key)
- **Parâmetros de Query**:
  - `fields`: Campos a serem incluídos na resposta
  - `limit`: Número máximo de itens (padrão: 50)
  - `offset`: Número de itens para pular
  - `q`: Busca por texto
  - `id`: Filtrar por IDs específicos
  - `value`: Filtrar por valores específicos

#### Recuperar Product Tag por ID (Store)

- **Endpoint**: `GET /store/product-tags/{id}`
- **Descrição**: Recupera uma tag específica por ID
- **Autenticação**: Não requerida (usa publishable API key)
- **Parâmetros**:
  - `id` (path): ID da tag
  - `fields` (query): Campos a serem incluídos

### Admin API (Backend)

#### Listar Product Tags (Admin)

- **Endpoint**: `GET /admin/product-tags`
- **Descrição**: Recupera uma lista paginada de tags para administração
- **Autenticação**: JWT token ou cookie de sessão
- **Parâmetros**: Similar ao endpoint da store, mas com limite padrão de 20

#### Criar Product Tag

- **Endpoint**: `POST /admin/product-tags`
- **Descrição**: Cria uma nova tag de produto
- **Autenticação**: JWT token ou cookie de sessão
- **Body**:

  ```json
  {
    "value": "string",
    "metadata": {}
  }
  ```

#### Recuperar Product Tag por ID (Admin)

- **Endpoint**: `GET /admin/product-tags/{id}`
- **Descrição**: Recupera uma tag específica para administração
- **Autenticação**: JWT token ou cookie de sessão

#### Atualizar Product Tag

- **Endpoint**: `POST /admin/product-tags/{id}`
- **Descrição**: Atualiza uma tag existente
- **Autenticação**: JWT token ou cookie de sessão
- **Body**:

  ```json
  {
    "value": "string",
    "metadata": {}
  }
  ```

#### Deletar Product Tag

- **Endpoint**: `DELETE /admin/product-tags/{id}`
- **Descrição**: Remove uma tag de produto
- **Autenticação**: JWT token ou cookie de sessão

## Schemas e Tipos

### ProductTagDTO

```typescript
interface ProductTagDTO {
  id: string;           // ID único da tag
  value: string;        // Valor/texto da tag
  metadata?: MetadataType; // Dados customizados
  products?: ProductDTO[]; // Produtos associados (opcional)
}
```

### CreateProductTagDTO

```typescript
interface CreateProductTagDTO {
  value: string;        // Valor da tag (obrigatório)
}
```

### UpsertProductTagDTO

```typescript
interface UpsertProductTagDTO {
  id?: string;          // ID para atualização (opcional)
  value: string;        // Valor da tag
}
```

### Respostas da API

#### StoreProductTagResponse

```typescript
interface StoreProductTagResponse {
  product_tag: StoreProductTag;
}
```

#### StoreProductTagListResponse

```typescript
interface StoreProductTagListResponse {
  product_tags: StoreProductTag[];
  count: number;
  offset: number;
  limit: number;
}
```

#### AdminProductTagResponse

```typescript
interface AdminProductTagResponse {
  product_tag: AdminProductTag;
}
```

#### AdminProductTagListResponse

```typescript
interface AdminProductTagListResponse {
  product_tags: AdminProductTag[];
  count: number;
  offset: number;
  limit: number;
}
```

## Exemplos de Uso

### JavaScript SDK - Criar Tag

```javascript
import Medusa from "@medusajs/js-sdk"

const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
})

sdk.admin.productTag.create({
  value: "shirt"
})
.then(({ product_tag }) => {
  console.log(product_tag)
})
```

### cURL - Listar Tags

```bash
curl '{backend_url}/store/product-tags' \
  -H 'x-publishable-api-key: {your_publishable_api_key}'
```

### cURL - Criar Tag

```bash
curl -X POST '{backend_url}/admin/product-tags' \
  -H 'Authorization: Bearer {jwt_token}' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "value": "digital",
    "metadata": {}
  }'
```

## Workflows

### createProductTagsWorkflow

- **ID**: `create-product-tags`
- **Descrição**: Workflow para criar uma ou mais tags de produto
- **Entrada**:

  ```typescript
  {
    product_tags: CreateProductTagDTO[];
    additional_data?: Record<string, unknown>;
  }
  ```

- **Saída**: `ProductTagDTO[]`

### updateProductTagsWorkflow

- **ID**: `update-product-tags`
- **Descrição**: Workflow para atualizar tags existentes
- **Entrada**: Dados de atualização das tags
- **Saída**: `ProductTagDTO[]`

### deleteProductTagsWorkflow

- **ID**: `delete-product-tags`
- **Descrição**: Workflow para deletar tags de produto
- **Entrada**: IDs das tags a serem deletadas

## Modelo de Dados

### Estrutura da Tabela

```sql
CREATE TABLE product_tag (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  value VARCHAR NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Índice único para garantir valores únicos
CREATE UNIQUE INDEX idx_tag_value_unique
ON product_tag (value)
WHERE deleted_at IS NULL;
```

### Relacionamentos

- **Products**: Uma tag pode estar associada a múltiplos produtos (relação many-to-many)
- **Módulo**: Product Module (`@medusajs/product`)

## Validações

### Store Validators

- Campos selecionáveis: `id`, `value`, `created_at`, `updated_at`, `metadata`, `*products`
- Filtros suportados: `q`, `id`, `value`, `created_at`, `updated_at`, `deleted_at`
- Operadores: `$eq`, `$ne`, `$in`, `$nin`, `$like`, `$ilike`, etc.

### Admin Validators

- Criação: `value` obrigatório, `metadata` opcional
- Atualização: `value` e `metadata` opcionais
- Listagem: Suporte a paginação e filtros avançados

## Eventos

### product-tag.created

Emitido quando uma tag é criada:

```json
{
  "id": "ptag_123"
}
```

### product-tag.updated

Emitido quando uma tag é atualizada:

```json
{
  "id": "ptag_123"
}
```

## Considerações de Segurança

- **Store API**: Requer publishable API key no header
- **Admin API**: Requer autenticação JWT ou sessão
- **Validação**: Todas as entradas são validadas usando Zod schemas
- **Sanitização**: Dados são sanitizados antes da persistência

## Boas Práticas

1. **Convenções de Nomenclatura**: Use valores descritivos em minúsculas (ex: "digital", "physical", "clothing")
2. **Metadata**: Use metadata para informações adicionais não estruturadas
3. **Paginação**: Sempre implemente paginação para listagens grandes
4. **Cache**: Configure cache apropriado para endpoints de leitura
5. **Índices**: Considere índices adicionais para campos frequentemente filtrados

## Integração com Outros Módulos

- **Product Module**: Tags são associadas diretamente aos produtos
- **Query Module**: Use para consultas complexas envolvendo relacionamentos
- **Cart/Checkout**: Tags podem influenciar regras de negócio no carrinho
- **Search**: Tags melhoram a descoberta de produtos

## Troubleshooting

### Problemas Comuns

1. **Tag não encontrada (404)**: Verifique se o ID está correto
2. **Conflito de valor (409)**: Tags devem ter valores únicos
3. **Erro de validação (422)**: Verifique os campos obrigatórios
4. **Erro de autorização (401)**: Verifique tokens de autenticação

### Logs e Debug

- Workflows emitem logs detalhados para debugging
- Use `req.scope` para acessar serviços em middlewares customizados
- Verifique configurações de CORS para chamadas cross-origin
