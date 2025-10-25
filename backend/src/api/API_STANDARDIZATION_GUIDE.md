# API Standardization Guide - Medusa.js Conventions

## Objetivo

Padronizar todas as APIs do YSH seguindo as convenções do Medusa.js 2.x para consistência, manutenibilidade e compatibilidade com o ecossistema.

---

## Estrutura de Diretórios

```
src/api/
├── store/              # APIs públicas (frontend)
│   ├── [resource]/
│   │   ├── route.ts           # GET, POST (list/create)
│   │   ├── [id]/
│   │   │   └── route.ts       # GET, POST, DELETE (retrieve/update/delete)
│   │   ├── middlewares.ts     # Middlewares específicos
│   │   ├── query-config.ts    # Configuração de queries
│   │   └── validators.ts      # Zod schemas
│   └── middlewares.ts         # Middlewares globais store
├── admin/              # APIs administrativas
│   └── [resource]/            # Mesma estrutura que store
└── middlewares.ts      # Middlewares globais
```

---

## Padrões de Nomenclatura

### Endpoints

| Operação | Método | Endpoint | Handler |
|----------|--------|----------|---------|
| List | GET | `/store/resources` | `GET` |
| Create | POST | `/store/resources` | `POST` |
| Retrieve | GET | `/store/resources/{id}` | `GET` |
| Update | POST | `/store/resources/{id}` | `POST` |
| Delete | DELETE | `/store/resources/{id}` | `DELETE` |

### Arquivos

- `route.ts`: Handlers HTTP (GET, POST, DELETE)
- `middlewares.ts`: Middlewares de autenticação/autorização
- `query-config.ts`: Configuração de campos/relações
- `validators.ts`: Schemas Zod para validação

---

## Template de Route Handler

### List (GET /store/resources)

```typescript
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { GetResourcesParamsType } from "./validators";

export const GET = async (
  req: AuthenticatedMedusaRequest<GetResourcesParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: resources, metadata } = await query.graph({
    entity: "resource",
    fields: req.queryConfig.fields,
    filters: {
      // Filtros específicos
      ...req.validatedQuery,
    },
    pagination: req.queryConfig.pagination,
  });

  res.json({
    resources,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  });
};
```

### Create (POST /store/resources)

```typescript
import { createResourceWorkflow } from "../../../workflows/resource/create-resource";

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateResourceType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { result } = await createResourceWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      created_by: req.auth_context.actor_id,
    },
  });

  const { data: [resource] } = await query.graph({
    entity: "resource",
    fields: req.queryConfig.fields,
    filters: { id: result.id },
  }, { throwIfKeyNotFound: true });

  res.json({ resource });
};
```

### Retrieve (GET /store/resources/{id})

```typescript
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: [resource] } = await query.graph({
    entity: "resource",
    fields: req.queryConfig.fields,
    filters: { id: req.params.id },
  }, { throwIfKeyNotFound: true });

  res.json({ resource });
};
```

### Update (POST /store/resources/{id})

```typescript
import { updateResourceWorkflow } from "../../../workflows/resource/update-resource";

export const POST = async (
  req: AuthenticatedMedusaRequest<UpdateResourceType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  await updateResourceWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      ...req.validatedBody,
    },
  });

  const { data: [resource] } = await query.graph({
    entity: "resource",
    fields: req.queryConfig.fields,
    filters: { id: req.params.id },
  }, { throwIfKeyNotFound: true });

  res.json({ resource });
};
```

### Delete (DELETE /store/resources/{id})

```typescript
import { deleteResourceWorkflow } from "../../../workflows/resource/delete-resource";

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  await deleteResourceWorkflow(req.scope).run({
    input: { id: req.params.id },
  });

  res.json({
    id: req.params.id,
    object: "resource",
    deleted: true,
  });
};
```

---

## Validators (Zod)

```typescript
import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

// List query params
export type GetResourcesParamsType = z.infer<typeof GetResourcesParams>;
export const GetResourcesParams = createSelectParams().extend({
  q: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  limit: z.coerce.number().optional().default(50),
  offset: z.coerce.number().optional().default(0),
});

// Create body
export type CreateResourceType = z.infer<typeof CreateResource>;
export const CreateResource = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Update body
export type UpdateResourceType = z.infer<typeof UpdateResource>;
export const UpdateResource = CreateResource.partial();
```

---

## Query Config

```typescript
import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreResourceFields = [
  "id",
  "name",
  "description",
  "status",
  "created_at",
  "updated_at",
];

export const retrieveResourceQueryConfig = defineQueryConfig({
  defaults: defaultStoreResourceFields,
  allowed: [
    ...defaultStoreResourceFields,
    "metadata",
    "*related_entity",
  ],
});

export const listResourceQueryConfig = defineQueryConfig({
  defaults: defaultStoreResourceFields,
  allowed: [...defaultStoreResourceFields],
  defaultLimit: 50,
});
```

---

## Middlewares

### Autenticação

```typescript
import { authenticate } from "@medusajs/medusa/api/utils/authenticate-middleware";

export const AUTHENTICATE = authenticate("customer", ["session", "bearer"]);
```

### Autorização Customizada

```typescript
import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const requireCompanyAdmin = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  
  const { data: [employee] } = await query.graph({
    entity: "employee",
    fields: ["is_admin", "company_id"],
    filters: { customer_id: req.auth_context.actor_id },
  });

  if (!employee?.is_admin) {
    return res.status(403).json({
      message: "Company admin access required",
    });
  }

  req.companyId = employee.company_id;
  next();
};
```

---

## Respostas Padronizadas

### Sucesso (200/201)

```typescript
// Single resource
res.json({ resource });

// List
res.json({
  resources,
  count: metadata.count,
  offset: metadata.skip,
  limit: metadata.take,
});

// Delete
res.json({
  id: req.params.id,
  object: "resource",
  deleted: true,
});
```

### Erro (4xx/5xx)

```typescript
// Medusa lança automaticamente:
// - 400: Validation error (Zod)
// - 401: Unauthorized
// - 404: Not found (throwIfKeyNotFound)
// - 500: Internal error

// Custom error
throw new MedusaError(
  MedusaError.Types.NOT_ALLOWED,
  "Custom error message"
);
```

---

## Workflows

### Estrutura

```
workflows/
├── resource/
│   ├── steps/
│   │   ├── create-resource.ts
│   │   ├── validate-resource.ts
│   │   └── send-notification.ts
│   └── workflows/
│       ├── create-resource.ts
│       └── update-resource.ts
```

### Template

```typescript
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createResourceStep } from "../steps/create-resource";
import { validateResourceStep } from "../steps/validate-resource";

export const createResourceWorkflow = createWorkflow(
  "create-resource",
  (input: { name: string; created_by: string }) => {
    const validated = validateResourceStep(input);
    const resource = createResourceStep(validated);
    
    return new WorkflowResponse(resource);
  }
);
```

---

## Checklist de Padronização

### Por Endpoint

- [ ] Estrutura de diretórios correta
- [ ] Nomenclatura de arquivos padronizada
- [ ] Handlers HTTP seguem template
- [ ] Validators Zod implementados
- [ ] Query config definido
- [ ] Middlewares aplicados corretamente
- [ ] Workflows utilizados (não lógica direta)
- [ ] Respostas padronizadas
- [ ] Tratamento de erros consistente
- [ ] Documentação inline (JSDoc)

### Por Módulo

- [ ] README.md com overview
- [ ] Exemplos de uso (cURL/SDK)
- [ ] Tipos exportados corretamente
- [ ] Testes unitários (opcional)
- [ ] Integração com módulos existentes

---

## Prioridades de Refatoração

### P0 (Crítico - APIs B2B Core)

1. `/store/companies` - ✅ Já padronizado
2. `/store/quotes` - ✅ Já padronizado
3. `/store/approvals` - ⚠️ Precisa refatoração
4. `/admin/companies` - ✅ Já padronizado
5. `/admin/quotes` - ✅ Já padronizado

### P1 (Alto - APIs Públicas)

1. `/store/catalog` - ⚠️ Revisar validators
2. `/store/financing` - ⚠️ Adicionar workflows
3. `/store/solar-calculations` - ⚠️ Padronizar respostas
4. `/store/credit-analyses` - ⚠️ Adicionar query-config

### P2 (Médio - APIs Internas)

1. `/store/internal-catalog` - ⚠️ Revisar estrutura
2. `/store/kits` - ⚠️ Adicionar validators
3. `/store/leads` - ⚠️ Padronizar
4. `/pvlib/*` - ⚠️ Revisar nomenclatura

### P3 (Baixo - APIs Auxiliares)

1. `/aneel/*` - ⚠️ Documentar
2. `/solar/*` - ⚠️ Consolidar
3. `/store/rag/*` - ⚠️ Revisar

---

## Exemplos de Refatoração

### Antes (Não Padronizado)

```typescript
// ❌ Lógica direta no handler
export const POST = async (req, res) => {
  const service = req.scope.resolve("companyModuleService");
  const company = await service.createCompany(req.body);
  res.json(company);
};
```

### Depois (Padronizado)

```typescript
// ✅ Usa workflow + query graph
export const POST = async (
  req: AuthenticatedMedusaRequest<CreateCompanyType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { result } = await createCompanyWorkflow(req.scope).run({
    input: req.validatedBody,
  });

  const { data: [company] } = await query.graph({
    entity: "company",
    fields: req.queryConfig.fields,
    filters: { id: result.id },
  }, { throwIfKeyNotFound: true });

  res.json({ company });
};
```

---

## Recursos

- [Medusa API Routes](https://docs.medusajs.com/learn/basics/api-routes)
- [Workflows](https://docs.medusajs.com/learn/basics/workflows)
- [Query](https://docs.medusajs.com/learn/basics/query)
- [Zod Validation](https://zod.dev/)

---

**Última Atualização**: 2025-01-XX  
**Responsável**: Backend Team
