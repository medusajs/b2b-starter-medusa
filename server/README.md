# Yello Solar Hub - Medusa v2 Server

Backend server for Yello Solar Hub B2B e-commerce platform, built on Medusa v2.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- PostgreSQL 15+
- (Optional) Redis for caching/sessions

### Initial Setup

1. **Install dependencies**:

   ```powershell
   cd server
   yarn install
   # or
   npm install
   ```

2. **Configure environment**:

   ```powershell
   # Copy the example file
   Copy-Item .env.example .env
   
   # Edit .env with your actual values
   notepad .env
   ```

   **Required variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Generate with `openssl rand -base64 32`
   - `COOKIE_SECRET`: Generate with `openssl rand -base64 32`

3. **Run migrations**:

   ```powershell
   yarn migrate
   ```

4. **Seed initial data** (optional):

   ```powershell
   yarn seed
   ```

5. **Start development server**:

   ```powershell
   yarn dev
   ```

   Server will be available at:
   - API: `http://localhost:9000`
   - Admin UI: `http://localhost:9000/app`

## 📁 Project Structure

```
server/
├── src/
│   ├── admin/          # Admin UI customizations
│   ├── api/            # REST API routes (store & admin)
│   ├── jobs/           # Background jobs & scheduled tasks
│   ├── links/          # Module links (defineLink)
│   ├── modules/        # Custom Medusa modules
│   ├── scripts/        # CLI scripts (seed, migrations, etc.)
│   ├── subscribers/    # Event subscribers
│   └── workflows/      # Business logic workflows
├── .env.example        # Environment template
├── medusa-config.ts    # Medusa configuration
├── package.json        # Dependencies & scripts
└── tsconfig.json       # TypeScript configuration
```

## 🏗️ Architecture Principles

### Medusa v2 Best Practices

1. **Modules First**: All domain logic lives in custom modules (`src/modules/`)
2. **Workflows for Business Logic**: Use workflows for orchestration, not direct service calls
3. **Module Links**: Never use foreign keys between modules - use `defineLink()` instead
4. **Query Graph API**: Use `query.graph()` for cross-module queries
5. **Server Actions**: API routes execute workflows and return formatted responses

### Directory Guidelines

#### `/src/modules/`

Custom Medusa modules for domain-specific logic:

```typescript
// Example: src/modules/unified-catalog/index.ts
import { Module } from "@medusajs/framework/utils";

export const UNIFIED_CATALOG_MODULE = "unifiedCatalog";

export default Module(UNIFIED_CATALOG_MODULE, {
  service: UnifiedCatalogService
});
```

**After creating models**:

```powershell
yarn medusa db:generate <ModuleName>
yarn medusa db:migrate
```

#### `/src/links/`

Define relationships between modules:

```typescript
// Example: src/links/catalog-product.ts
import { defineLink } from "@medusajs/framework/utils";
import UnifiedCatalogModule from "../modules/unified-catalog";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(
  UnifiedCatalogModule.linkable.catalogItem,
  ProductModule.linkable.product
);
```

#### `/src/workflows/`

Business logic orchestration:

```typescript
// Example: src/workflows/sync-catalog.ts
import { createWorkflow, createStep } from "@medusajs/workflows-sdk";

export const syncCatalogWorkflow = createWorkflow(
  "sync-catalog",
  function (input) {
    const items = fetchCatalogStep(input);
    const synced = syncProductsStep(items);
    return new WorkflowResponse(synced);
  }
);
```

#### `/src/api/`

REST endpoints using file-based routing:

```typescript
// Example: src/api/store/catalog/route.ts
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  
  const { data } = await query.graph({
    entity: "catalog_items",
    fields: ["id", "name", "sku"],
  });
  
  res.json({ items: data });
};
```

#### `/src/subscribers/`

Event-driven side effects:

```typescript
// Example: src/subscribers/product-created.ts
export default async function productCreatedHandler({
  event: { data },
  container
}) {
  const catalogService = container.resolve("unifiedCatalogService");
  await catalogService.syncProduct(data.id);
}
```

## 📝 Available Scripts

```powershell
# Development
yarn dev              # Start with hot-reload

# Build & Production
yarn build            # Compile TypeScript
yarn start            # Start production server

# Database
yarn migrate          # Run migrations
yarn medusa db:generate <Module>  # Generate migration from model changes

# Seeding
yarn seed             # Run seed script

# Admin User
yarn medusa user -e admin@test.com -p password -i admin
```

## 🔧 Configuration

### Database Connection

Set `DATABASE_URL` in `.env`:

```
DATABASE_URL=postgres://user:password@localhost:5432/ysh_medusa
```

### CORS Configuration

Update `medusa-config.ts` for your frontend domains:

```typescript
http: {
  storeCors: [
    "http://localhost:3000",    // Local storefront
    "https://yourdomain.com"    // Production
  ],
  adminCors: [
    "http://localhost:9000/app" // Admin UI
  ]
}
```

### Redis (Optional)

For sessions and caching:

```typescript
// In medusa-config.ts
projectConfig: {
  redisUrl: process.env.REDIS_URL,
  // ...
}
```

## 🔐 Security

**Never commit**:

- `.env` files with real credentials
- `JWT_SECRET` or `COOKIE_SECRET` values
- API keys or tokens

**Always**:

- Use `.env.example` for templates
- Generate strong secrets: `openssl rand -base64 32`
- Rotate secrets regularly in production

## 🧪 Testing

Structure for tests (to be added):

```
server/
├── src/__tests__/       # Unit tests
└── integration-tests/   # Integration tests
    ├── http/           # API endpoint tests
    └── modules/        # Module tests
```

## 📚 Additional Resources

- [Medusa v2 Documentation](https://docs.medusajs.com/v2)
- [Module Development Guide](https://docs.medusajs.com/v2/resources/architectural-modules)
- [Workflows Guide](https://docs.medusajs.com/v2/resources/workflows)
- [API Routes Guide](https://docs.medusajs.com/v2/resources/api-routes)

## 🤝 Integration with Monorepo

This server integrates with:

- **Frontend**: `../storefront` - Next.js 15 storefront
- **Backend**: `../backend` - Existing Medusa backend (reference)
- **Data Platform**: `../data-platform` - Analytics and reporting

## 📋 Next Steps

1. ✅ Create directory structure
2. ✅ Configure environment files
3. ⏳ Define custom modules (unified catalog, energy calculations)
4. ⏳ Create module links
5. ⏳ Implement workflows
6. ⏳ Build API endpoints
7. ⏳ Add event subscribers
8. ⏳ Write tests
9. ⏳ Deploy to production

---

**Questions or issues?** Check the main project documentation in `/docs` or refer to the parent `README.md`.
