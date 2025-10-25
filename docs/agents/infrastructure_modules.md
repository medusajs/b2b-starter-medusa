# Medusa Infrastructure Modules Reference

## Visão Geral

Os Infrastructure Modules do Medusa implementam funcionalidades arquiteturais essenciais como emissão e subscrição de eventos, cache de dados, armazenamento de arquivos, notificações, entre outros. Um Infrastructure Module é um pacote que pode ser instalado e usado em qualquer aplicação Medusa, permitindo escolher e integrar serviços customizados para propósitos arquiteturais.

Por exemplo, você pode usar o Redis Event Module para funcionalidades de eventos, ou criar um módulo customizado que implemente essas funcionalidades com Memcached.

## Módulos Disponíveis

### Analytics Module

**Disponível desde**: Medusa v2.8.3

O Analytics Module expõe funcionalidades para rastrear e analisar interações do usuário e eventos do sistema. Por exemplo, rastrear atualizações de carrinho ou pedidos concluídos.

#### Providers do Analytics Module

- **Local** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/analytics/local`
  - Uso: Desenvolvimento local

- **PostHog** (Produção)
  - Link: `/resources/infrastructure-modules/analytics/posthog`
  - Uso: Produção com PostHog

**Documentação**: `/resources/infrastructure-modules/analytics`

### Cache Module

O Cache Module é usado para armazenar em cache os resultados de computações como seleção de preços ou cálculos de impostos.

#### Providers do Cache Module

- **In-Memory** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/cache/in-memory`
  - Uso: Desenvolvimento local

- **Redis** (Produção)
  - Link: `/resources/infrastructure-modules/cache/redis`
  - Uso: Produção com Redis

**Documentação**: `/resources/infrastructure-modules/cache`
**Guia de Criação**: `/resources/infrastructure-modules/cache/create`

### Event Module

O Event Module implementa o sistema publish/subscribe subjacente que gerencia o enfileiramento de eventos, emissão e execução de subscribers.

#### Providers do Event Module

- **Local** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/event/local`
  - Uso: Desenvolvimento local

- **Redis** (Produção)
  - Link: `/resources/infrastructure-modules/event/redis`
  - Uso: Produção com Redis

**Documentação**: `/resources/infrastructure-modules/event`
**Guia de Criação**: `/resources/infrastructure-modules/event/create`

### File Module

O File Module gerencia upload e armazenamento de arquivos de assets, como imagens de produtos.

#### Providers do File Module

- **Local** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/file/local`
  - Uso: Desenvolvimento local

- **AWS S3** (Produção)
  - Link: `/resources/infrastructure-modules/file/s3`
  - Uso: Produção com AWS S3 e APIs compatíveis

**Documentação**: `/resources/infrastructure-modules/file`
**Guia de Criação**: `/resources/references/file-provider-module`

### Locking Module

O Locking Module gerencia acesso a recursos compartilhados por múltiplos processos ou threads. Previne conflitos entre processos e garante consistência de dados.

#### Providers do Locking Module

- **Redis** (Recomendado)
  - Link: `/resources/infrastructure-modules/locking/redis`
  - Uso: Produção com Redis

- **PostgreSQL**
  - Link: `/resources/infrastructure-modules/locking/postgres`
  - Uso: Produção com PostgreSQL

**Documentação**: `/resources/infrastructure-modules/locking`
**Guia de Criação**: `/resources/references/locking-module-provider`

### Notification Module

O Notification Module gerencia envio de notificações para usuários ou clientes, como instruções de reset de senha ou newsletters.

#### Providers do Notification Module

- **Local** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/notification/local`
  - Uso: Desenvolvimento local

- **SendGrid** (Produção)
  - Link: `/resources/infrastructure-modules/notification/sendgrid`
  - Uso: Produção com SendGrid

#### Guias Adicionais do Notification Module

- **Enviar Notificação**: `/resources/infrastructure-modules/notification/send-notification`
- **Criar Provider**: `/resources/references/notification-provider-module`
- **Integração Resend**: `/resources/integrations/guides/resend`

**Documentação**: `/resources/infrastructure-modules/notification`

### Workflow Engine Module

O Workflow Engine Module gerencia rastreamento e gravação de transações e status de workflows e seus steps.

#### Providers do Workflow Engine Module

- **In-Memory** (Desenvolvimento)
  - Link: `/resources/infrastructure-modules/workflow-engine/in-memory`
  - Uso: Desenvolvimento local

- **Redis** (Produção)
  - Link: `/resources/infrastructure-modules/workflow-engine/redis`
  - Uso: Produção com Redis

**Documentação**: `/resources/infrastructure-modules/workflow-engine`

## Como Usar Infrastructure Modules

### Instalação

Infrastructure Modules são pacotes npm que podem ser instalados em qualquer aplicação Medusa:

```bash
npm install @medusajs/event-redis
# ou
yarn add @medusajs/event-redis
```

### Configuração

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

### Criação de Módulos Customizados

Você pode criar seus próprios Infrastructure Modules seguindo os guias específicos de cada tipo:

1. **Cache Module**: Implemente interface de cache customizada
2. **Event Module**: Implemente sistema pub/sub customizado
3. **File Module**: Implemente provider de armazenamento customizado
4. **Notification Module**: Implemente serviço de notificações customizado

Cada módulo segue padrões específicos do Medusa e pode ser usado como substituto dos módulos padrão.

## Arquitetura e Design

### Princípios

- **Modularidade**: Cada infraestrutura é um módulo independente
- **Intercambialidade**: Módulos podem ser trocados sem afetar outros
- **Configurabilidade**: Opções específicas por ambiente (dev/prod)
- **Extensibilidade**: Possibilidade de criar implementações customizadas

### Benefícios

- **Flexibilidade**: Escolha serviços que melhor atendem suas necessidades
- **Performance**: Otimize para seu caso de uso específico
- **Custos**: Use serviços gratuitos para desenvolvimento
- **Escalabilidade**: Mude providers conforme cresce

## Casos de Uso Comuns

### Desenvolvimento Local

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

### Produção

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

## Troubleshooting

### Problemas Comuns

1. **Módulo não encontrado**: Verifique se o pacote está instalado corretamente
2. **Configuração inválida**: Valide as opções do módulo na documentação
3. **Conexão falhando**: Verifique credenciais e conectividade de rede
4. **Performance**: Monitore uso de recursos e ajuste configurações

### Debugging

- Verifique logs do Medusa para erros de inicialização
- Use ferramentas específicas do provider (Redis CLI, AWS Console)
- Teste conexões manualmente antes de configurar no Medusa

## Referências

- **Documentação Principal**: `/learn/introduction/architecture`
- **Referências de API**: `/references`
- **Guias de Integração**: `/resources/integrations`
- **Exemplos**: `/resources/recipes`

## Próximos Passos

1. Escolha os módulos necessários para seu caso de uso
2. Configure providers apropriados para desenvolvimento
3. Planeje migração para providers de produção
4. Monitore performance e custos
5. Considere criação de módulos customizados se necessário
 
 
