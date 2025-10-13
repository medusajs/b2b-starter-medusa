# Medusa Product Tags API Reference

## Visão Geral

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
