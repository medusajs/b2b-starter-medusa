# Medusa Agents API & Infrastructure Modules Reference

## Visão Geral

Este documento é uma referência completa para trabalhar com APIs e Infrastructure Modules do Medusa.js. Ele combina informações sobre a API de Product Tags e todos os módulos de infraestrutura disponíveis.

## Parte 1: Product Tags API

### Visão Geral da API

A API de Product Tags do Medusa permite gerenciar tags de produtos na loja. As tags são usadas para categorizar e organizar produtos, facilitando a navegação e busca.

### Endpoints da API

#### Store API (Frontend)

##### Listar Product Tags (Store)

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

##### Recuperar Product Tag por ID (Store)

- **Endpoint**: `GET /store/product-tags/{id}`
- **Descrição**: Recupera uma tag específica por ID
- **Autenticação**: Não requerida (usa publishable API key)
- **Parâmetros**:
  - `id` (path): ID da tag
  - `fields` (query): Campos a serem incluídos

#### Admin API (Backend)

##### Listar Product Tags (Admin)

- **Endpoint**: `GET /admin/product-tags`
- **Descrição**: Recupera uma lista paginada de tags para administração
- **Autenticação**: JWT token ou cookie de sessão
- **Parâmetros**: Similar ao endpoint da store, mas com limite padrão de 20

##### Criar Product Tag

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

##### Recuperar Product Tag por ID (Admin)

- **Endpoint**: `GET /admin/product-tags/{id}`
- **Descrição**: Recupera uma tag específica para administração
- **Autenticação**: JWT token ou cookie de sessão

##### Atualizar Product Tag

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

##### Deletar Product Tag

- **Endpoint**: `DELETE /admin/product-tags/{id}`
- **Descrição**: Remove uma tag de produto
- **Autenticação**: JWT token ou cookie de sessão

### Schemas e Tipos (Product Tags)

#### ProductTagDTO

```typescript
interface ProductTagDTO {
  id: string;           // ID único da tag
  value: string;        // Valor/texto da tag
  metadata?: MetadataType; // Dados customizados
  products?: ProductDTO[]; // Produtos associados (opcional)
}
```

#### CreateProductTagDTO

```typescript
interface CreateProductTagDTO {
  value: string;        // Valor da tag (obrigatório)
}
```

#### UpsertProductTagDTO

```typescript
interface UpsertProductTagDTO {
  id?: string;          // ID para atualização (opcional)
  value: string;        // Valor da tag
}
```

### Exemplos de Uso (Product Tags)

#### JavaScript SDK - Criar Tag

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

#### cURL - Listar Tags

```bash
curl '{backend_url}/store/product-tags' \
  -H 'x-publishable-api-key: {your_publishable_api_key}'
```

#### cURL - Criar Tag

```bash
curl -X POST '{backend_url}/admin/product-tags' \
  -H 'Authorization: Bearer {jwt_token}' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "value": "digital",
    "metadata": {}
  }'
```

### Workflows (Product Tags)

#### createProductTagsWorkflow

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

#### updateProductTagsWorkflow

- **ID**: `update-product-tags`
- **Descrição**: Workflow para atualizar tags existentes
- **Entrada**: Dados de atualização das tags
- **Saída**: `ProductTagDTO[]`

#### deleteProductTagsWorkflow

- **ID**: `delete-product-tags`
- **Descrição**: Workflow para deletar tags de produto
- **Entrada**: IDs das tags a serem deletadas

### Modelo de Dados (Product Tags)

#### Estrutura da Tabela

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

#### Relacionamentos

- **Products**: Uma tag pode estar associada a múltiplos produtos (relação many-to-many)
- **Módulo**: Product Module (`@medusajs/product`)

---

## Parte 2: Infrastructure Modules

### Visão Geral dos Infrastructure Modules

Os Infrastructure Modules do Medusa implementam funcionalidades arquiteturais essenciais como emissão e subscrição de eventos, cache de dados, armazenamento de arquivos, notificações, entre outros. Um Infrastructure Module é um pacote que pode ser instalado e usado em qualquer aplicação Medusa, permitindo escolher e integrar serviços customizados para propósitos arquiteturais.

Por exemplo, você pode usar o Redis Event Module para funcionalidades de eventos, ou criar um módulo customizado que implemente essas funcionalidades com Memcached.

### Módulos Disponíveis

#### Analytics Module

**Disponível desde**: Medusa v2.8.3

O Analytics Module expõe funcionalidades para rastrear e analisar interações do usuário e eventos do sistema. Por exemplo, rastrear atualizações de carrinho ou pedidos concluídos.

##### Providers do Analytics Module

- **Local** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/analytics/local`
  - Uso: Desenvolvimento local

- **PostHog** (Produção)
  - Link: `/resources/infrastructure-modules/analytics/posthog`
  - Uso: Produção com PostHog

**Documentação**: `/resources/infrastructure-modules/analytics`

#### Cache Module

O Cache Module é usado para armazenar em cache os resultados de computações como seleção de preços ou cálculos de impostos.

##### Providers do Cache Module

- **In-Memory** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/cache/in-memory`
  - Uso: Desenvolvimento local

- **Redis** (Produção)
  - Link: `/resources/infrastructure-modules/cache/redis`
  - Uso: Produção com Redis

**Documentação**: `/resources/infrastructure-modules/cache`
**Guia de Criação**: `/resources/infrastructure-modules/cache/create`

#### Event Module

O Event Module implementa o sistema publish/subscribe subjacente que gerencia o enfileiramento de eventos, emissão e execução de subscribers.

##### Providers do Event Module

- **Local** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/event/local`
  - Uso: Desenvolvimento local

- **Redis** (Produção)
  - Link: `/resources/infrastructure-modules/event/redis`
  - Uso: Produção com Redis

**Documentação**: `/resources/infrastructure-modules/event`
**Guia de Criação**: `/resources/infrastructure-modules/event/create`

#### File Module

O File Module gerencia upload e armazenamento de arquivos de assets, como imagens de produtos.

##### Providers do File Module

- **Local** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/file/local`
  - Uso: Desenvolvimento local

- **AWS S3** (Produção)
  - Link: `/resources/infrastructure-modules/file/s3`
  - Uso: Produção com AWS S3 e APIs compatíveis

**Documentação**: `/resources/infrastructure-modules/file`
**Guia de Criação**: `/resources/references/file-provider-module`

#### Locking Module

O Locking Module gerencia acesso a recursos compartilhados por múltiplos processos ou threads. Previne conflitos entre processos e garante consistência de dados.

##### Providers do Locking Module

- **Redis** (Recomendado)
  - Link: `/resources/infrastructure-modules/locking/redis`
  - Uso: Produção com Redis

- **PostgreSQL**
  - Link: `/resources/infrastructure-modules/locking/postgres`
  - Uso: Produção com PostgreSQL

**Documentação**: `/resources/infrastructure-modules/locking`
**Guia de Criação**: `/resources/references/locking-module-provider`

#### Notification Module

O Notification Module gerencia envio de notificações para usuários ou clientes, como instruções de reset de senha ou newsletters.

##### Providers do Notification Module

- **Local** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/notification/local`
  - Uso: Desenvolvimento local

- **SendGrid** (Produção)
  - Link: `/resources/infrastructure-modules/notification/sendgrid`
  - Uso: Produção com SendGrid

##### Guias Adicionais do Notification Module

- **Enviar Notificação**: `/resources/infrastructure-modules/notification/send-notification`
- **Criar Provider**: `/resources/references/notification-provider-module`
- **Integração Resend**: `/resources/integrations/guides/resend`

**Documentação**: `/resources/infrastructure-modules/notification`

#### Workflow Engine Module

O Workflow Engine Module gerencia rastreamento e gravação de transações e status de workflows e seus steps.

##### Providers do Workflow Engine Module

- **In-Memory** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/workflow-engine/in-memory`
  - Uso: Desenvolvimento local

- **Redis** (Produção)
  - Link: `/resources/infrastructure-modules/workflow-engine/redis`
  - Uso: Produção com Redis

**Documentação**: `/resources/infrastructure-modules/workflow-engine`

### Como Usar Infrastructure Modules

#### Instalação

Infrastructure Modules são pacotes npm que podem ser instalados em qualquer aplicação Medusa:

```bash
npm install @medusajs/event-redis
# ou
yarn add @medusajs/event-redis
```

#### Configuração

Após instalar, configure o módulo no `medusa-config.ts`:

```typescript
import { Modules } from "@medusajs/framework/utils"

export default defineConfig({
  // ... outras configurações
  modules: {
    [Modules.EVENT]: {
      resolve: "@medusajs/event-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
  },
})
```

#### Criação de Módulos Customizados

Você pode criar seus próprios Infrastructure Modules seguindo os guias específicos de cada tipo:

1. **Cache Module**: Implemente interface de cache customizada
2. **Event Module**: Implemente sistema pub/sub customizado
3. **File Module**: Implemente provider de armazenamento customizado
4. **Notification Module**: Implemente serviço de notificações customizado

Cada módulo segue padrões específicos do Medusa e pode ser usado como substituto dos módulos padrão.

#### Arquitetura e Design

##### Princípios

- **Modularidade**: Cada infraestrutura é um módulo independente
- **Intercambialidade**: Módulos podem ser trocados sem afetar outros
- **Configurabilidade**: Opções específicas por ambiente (dev/prod)
- **Extensibilidade**: Possibilidade de criar implementações customizadas

##### Benefícios

- **Flexibilidade**: Escolha serviços que melhor atendem suas necessidades
- **Performance**: Otimize para seu caso de uso específico
- **Custos**: Use serviços gratuitos para desenvolvimento
- **Escalabilidade**: Mude providers conforme cresce

#### Casos de Uso Comuns

##### Desenvolvimento Local

```typescript
// Configuração típica para desenvolvimento
modules: {
  [Modules.CACHE]: {
    resolve: "@medusajs/cache-in-memory",
  },
  [Modules.EVENT]: {
    resolve: "@medusajs/event-local",
  },
  [Modules.FILE]: {
    resolve: "@medusajs/file-local",
  },
}
```

##### Produção

```typescript
// Configuração típica para produção
modules: {
  [Modules.CACHE]: {
    resolve: "@medusajs/cache-redis",
    options: { redisUrl: process.env.REDIS_URL },
  },
  [Modules.EVENT]: {
    resolve: "@medusajs/event-redis",
    options: { redisUrl: process.env.REDIS_URL },
  },
  [Modules.FILE]: {
    resolve: "@medusajs/file-s3",
    options: {
      access_key_id: process.env.AWS_ACCESS_KEY_ID,
      secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
    },
  },
}
```

---

## Parte 3: Validações, Segurança e Troubleshooting

### Validações

#### Store Validators (Product Tags)

- Campos selecionáveis: `id`, `value`, `created_at`, `updated_at`, `metadata`, `*products`
- Filtros suportados: `q`, `id`, `value`, `created_at`, `updated_at`, `deleted_at`
- Operadores: `$eq`, `$ne`, `$in`, `$nin`, `$like`, `$ilike`, etc.

#### Admin Validators (Product Tags)

- Criação: `value` obrigatório, `metadata` opcional
- Atualização: `value` e `metadata` opcionais
- Listagem: Suporte a paginação e filtros avançados

### Eventos

#### Eventos de Product Tags

- **product-tag.created**: Emitido quando uma tag é criada
- **product-tag.updated**: Emitido quando uma tag é atualizada

### Considerações de Segurança

#### Store API (Product Tags)

- **Store API**: Requer publishable API key no header
- **Admin API**: Requer autenticação JWT ou sessão
- **Validação**: Todas as entradas são validadas usando Zod schemas
- **Sanitização**: Dados são sanitizados antes da persistência

#### Segurança dos Infrastructure Modules

- **Configuração Segura**: Use variáveis de ambiente para credenciais
- **Acesso Restrito**: Configure corretamente permissões de providers externos
- **Monitoramento**: Implemente logging e alertas para falhas de infraestrutura

### Boas Práticas

#### Boas Práticas para Product Tags

1. **Convenções de Nomenclatura**: Use valores descritivos em minúsculas (ex: "digital", "physical", "clothing")
2. **Metadata**: Use metadata para informações adicionais não estruturadas
3. **Paginação**: Sempre implemente paginação para listagens grandes
4. **Cache**: Configure cache apropriado para endpoints de leitura
5. **Índices**: Considere índices adicionais para campos frequentemente filtrados

#### Boas Práticas para Infrastructure Modules

1. **Separação de Ambientes**: Use providers diferentes para desenvolvimento e produção
2. **Monitoramento**: Implemente métricas e alertas para todos os módulos
3. **Backup**: Configure estratégias de backup para dados críticos
4. **Testes**: Teste thoroughly mudanças de infraestrutura
5. **Documentação**: Mantenha documentação atualizada das configurações

### Troubleshooting

#### Problemas Comuns (Product Tags)

1. **Tag não encontrada (404)**: Verifique se o ID está correto
2. **Conflito de valor (409)**: Tags devem ter valores únicos
3. **Erro de validação (422)**: Verifique os campos obrigatórios
4. **Erro de autorização (401)**: Verifique tokens de autenticação

#### Problemas Comuns (Infrastructure Modules)

1. **Módulo não encontrado**: Verifique se o pacote está instalado corretamente
2. **Configuração inválida**: Valide as opções do módulo na documentação
3. **Conexão falhando**: Verifique credenciais e conectividade de rede
4. **Performance**: Monitore uso de recursos e ajuste configurações

### Logs e Debug

#### Debug de Product Tags

- Workflows emitem logs detalhados para debugging
- Use `req.scope` para acessar serviços em middlewares customizados
- Verifique configurações de CORS para chamadas cross-origin

#### Debug de Infrastructure Modules

- Verifique logs do Medusa para erros de inicialização
- Use ferramentas específicas do provider (Redis CLI, AWS Console)
- Teste conexões manualmente antes de configurar no Medusa

---

## Parte 4: Referências e Recursos

### Documentação Principal

- **Arquitetura Medusa**: `/learn/introduction/architecture`
- **Referências de API**: `/references`
- **Guias de Integração**: `/resources/integrations`
- **Exemplos**: `/resources/recipes`

### Links Úteis

#### APIs de Product Tags

- **API Reference**: `/api/store#product-tags_producttag_schema`
- **Admin API**: `/api/admin#product-tags`
- **Workflows**: `/resources/core-flows/Product`

#### Módulos de Infraestrutura

- **Analytics**: `/resources/infrastructure-modules/analytics`
- **Cache**: `/resources/infrastructure-modules/cache`
- **Event**: `/resources/infrastructure-modules/event`
- **File**: `/resources/infrastructure-modules/file`
- **Locking**: `/resources/infrastructure-modules/locking`
- **Notification**: `/resources/infrastructure-modules/notification`
- **Workflow Engine**: `/resources/infrastructure-modules/workflow-engine`

### Próximos Passos

1. **Product Tags**: Explore a API e implemente tags em seu catálogo
2. **Infrastructure**: Escolha módulos necessários para seu caso de uso
3. **Configuração**: Configure providers apropriados para desenvolvimento
4. **Produção**: Planeje migração para providers de produção
5. **Monitoramento**: Implemente monitoramento e alertas
6. **Customização**: Considere criação de módulos customizados se necessário

---

*Este documento foi gerado automaticamente a partir da documentação oficial do Medusa.js. Última atualização: Outubro 2025.*</content>
<parameter name="filePath">c:\Users\fjuni\ysh_medusa\ysh-store\agents_infra_modules.md

 
 
