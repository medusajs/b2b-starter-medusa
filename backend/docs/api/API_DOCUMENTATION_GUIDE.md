# API Documentation Guide

## Overview

A documentação OpenAPI está disponível em desenvolvimento via Swagger UI.

---

## Acessando a Documentação

### Desenvolvimento Local

```bash
# 1. Iniciar servidor
npm run dev

# 2. Abrir navegador
http://localhost:9000/docs
```

### Formato JSON (OpenAPI Spec)

```bash
curl http://localhost:9000/docs.json > openapi.json
```

---

## Documentando Endpoints

### Sintaxe JSDoc + OpenAPI

Use comentários JSDoc antes das funções de rota para gerar documentação automática:

```typescript
/**
 * @openapi
 * /store/companies:
 *   post:
 *     summary: Create a new company
 *     description: Registers a new B2B company with basic information
 *     tags:
 *       - Companies
 *     security:
 *       - publishableApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Solar Tech Solutions"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@solartech.com"
 *               phone:
 *                 type: string
 *                 example: "+55 11 98765-4321"
 *               currency_code:
 *                 type: string
 *                 default: "BRL"
 *                 example: "BRL"
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export const POST = async (
  req: AuthenticatedMedusaRequest<StoreCreateCompanyType>,
  res: MedusaResponse
) => {
  // Implementation...
};
```

---

## Estrutura da Documentação

### Tags (Categorias)

Organize endpoints por funcionalidade:

- **Companies**: Gerenciamento de empresas
- **Employees**: Operações com funcionários
- **Quotes**: Sistema de cotações
- **Approvals**: Workflows de aprovação
- **Cart**: Operações estendidas de carrinho

### Schemas (Modelos)

Defina modelos reutilizáveis em `src/utils/swagger.ts`:

```typescript
components: {
  schemas: {
    Company: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        // ...
      },
    },
  },
}
```

### Respostas Comuns

Reutilize respostas de erro:

```yaml
responses:
  401:
    $ref: '#/components/responses/Unauthorized'
  403:
    $ref: '#/components/responses/Forbidden'
  404:
    $ref: '#/components/responses/NotFound'
```

---

## Exemplos por Tipo de Endpoint

### GET com Query Parameters

```typescript
/**
 * @openapi
 * /store/companies:
 *   get:
 *     summary: List companies
 *     tags: [Companies]
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *       - name: q
 *         in: query
 *         description: Search query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 companies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *                 count:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
```

---

### POST com Request Body

```typescript
/**
 * @openapi
 * /store/quotes/{id}/messages:
 *   post:
 *     summary: Add message to quote
 *     tags: [Quotes]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Can we negotiate the price?"
 *               item_id:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Message created
 */
```

---

### PATCH com Partial Update

```typescript
/**
 * @openapi
 * /store/companies/{id}:
 *   patch:
 *     summary: Update company details
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               logo_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Company updated
 */
```

---

### DELETE

```typescript
/**
 * @openapi
 * /store/companies/{id}/employees/{employeeId}:
 *   delete:
 *     summary: Remove employee from company
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: employeeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Employee removed successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
```

---

## Autenticação na Documentação

### Testar Endpoints Autenticados

1. Obter JWT token via login:

```bash
POST /store/auth/customer/emailpass
{
  "email": "user@example.com",
  "password": "password"
}
```

2. Clicar em **"Authorize"** no Swagger UI

3. Inserir token no formato:

```tsx
Bearer eyJhbGciOiJIUzI1NiIs...
```

4. Testar endpoints protegidos

---

## Geração de Cliente SDK

### TypeScript Client

```bash
# Instalar gerador OpenAPI
npm install -D @openapitools/openapi-generator-cli

# Gerar client
npx openapi-generator-cli generate \
  -i http://localhost:9000/docs.json \
  -g typescript-axios \
  -o ./sdk/typescript
```

### Python Client

```bash
pip install openapi-generator-cli

openapi-generator-cli generate \
  -i http://localhost:9000/docs.json \
  -g python \
  -o ./sdk/python
```

---

## Boas Práticas

### ✅ DO

- Documente todos os endpoints públicos
- Use exemplos realistas nos schemas
- Defina tipos de erro claramente
- Agrupe endpoints por tags lógicas
- Mantenha descrições concisas e úteis

### ❌ DON'T

- Não exponha endpoints internos na documentação
- Não documente rotas deprecadas sem indicar
- Não usar exemplos genéricos ("string1", "string2")
- Não omitir campos obrigatórios

---

## Integração com Frontend

### Storefront (Next.js)

```typescript
// lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  headers: {
    'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  },
});

// Auto-generated from OpenAPI spec
export const createCompany = (data: CreateCompanyDto) => 
  apiClient.post('/store/companies', data);
```

---

## Troubleshooting

### Documentação não aparece

```bash
# Verificar se NODE_ENV está correto
echo $env:NODE_ENV  # Windows PowerShell
echo $NODE_ENV      # Bash

# Forçar habilitação em produção
ENABLE_API_DOCS=true npm start
```

### Swagger UI carrega mas endpoints não aparecem

```bash
# Verificar sintaxe JSDoc
npm run typecheck

# Regenerar spec
rm -rf .medusa/server
npm run build
```

### Erros de CORS ao testar

```bash
# Adicionar origem ao CORS em medusa-config.ts
store_cors: process.env.STORE_CORS || "http://localhost:3000,http://localhost:9000",
```

---

## Recursos

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Generator](https://openapi-generator.tech/)

---

**Última Atualização**: 2024-10-12
**Maintainers**: Backend Team
