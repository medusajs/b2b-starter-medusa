# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a B2B e-commerce starter built with Medusa 2.0 framework and Next.js, focused on enterprise commerce features including company management, approval workflows, quoting, and bulk ordering capabilities.

**Architecture:**
- **Backend**: Medusa 2.0 framework with custom modules (backend/)
- **Frontend**: Next.js 15 storefront with App Router (storefront/)
- **Database**: PostgreSQL with MikroORM
- **Search**: Algolia integration
- **State Management**: Zustand for client state, Medusa SDK for API calls

## Common Development Commands

### Backend (Medusa)
```bash
cd backend

# Development
yarn dev                    # Start development server with admin
yarn build                  # Build the application
yarn start                  # Start production server

# Database
npx medusa db:create        # Create database
npx medusa db:migrate       # Run migrations
yarn seed                   # Seed development data

# Testing
yarn test:integration:http      # Run HTTP integration tests
yarn test:integration:modules   # Run module integration tests  
yarn test:unit                  # Run unit tests

# Create admin user
yarn medusa user -e admin@test.com -p supersecret -i admin
```

### Storefront (Next.js)
```bash
cd storefront

# Development
yarn dev           # Start development server (port 8000)
yarn build         # Build for production
yarn start         # Start production server
yarn lint          # Run ESLint
```

## Architecture Overview

### Custom Modules (backend/src/modules/)

The application extends Medusa with four custom modules:

1. **Company Module** (`company/`): Manages B2B companies and employee relationships
2. **Approval Module** (`approval/`): Handles approval workflows for orders and spending limits
3. **Quote Module** (`quote/`): Manages quote requests and negotiations between customers and merchants
4. **Algolia Module** (`algolia/`): Integrates Algolia search with automatic product syncing

Each module follows Medusa's module pattern with:
- `models/`: Data models with decorators
- `service.ts`: Business logic and CRUD operations  
- `migrations/`: Database schema changes
- `index.ts`: Module registration

### API Structure (backend/src/api/)

API routes follow file-based routing:
- `admin/`: Admin panel endpoints for managing companies, quotes, approvals
- `store/`: Customer-facing endpoints for storefront
- `middlewares.ts`: Route-specific middleware configuration

Route files export HTTP method functions (GET, POST, PUT, DELETE) and use:
- Query validation with Zod schemas (`validators.ts`)
- Query configuration for filtering/pagination (`query-config.ts`)
- Middleware for authentication/authorization (`middlewares.ts`)

### Workflows (backend/src/workflows/)

Business logic is organized into Medusa workflows (step-based operations):

- **Company workflows**: Company CRUD, employee management, customer group assignments
- **Approval workflows**: Approval settings, status management, approval creation
- **Quote workflows**: Quote lifecycle (creation, acceptance, rejection, messaging)
- **Algolia workflows**: Product syncing and search index management
- **Hooks**: Event-driven workflows (cart validation, order processing)

### Links (backend/src/links/)

Module links establish relationships between different modules while maintaining isolation:
- Company-Product relationships
- Employee-Customer associations  
- Cart-Approval status connections
- Quote-related entity links

### Frontend Architecture (storefront/src/)

**Module Organization**: Features are organized in `modules/` with components and templates:
- `account/`: User account management, company admin features
- `cart/`: Shopping cart with approval status integration
- `checkout/`: Multi-step checkout with company context
- `products/`: Product listing, details, bulk ordering
- `quotes/`: Quote request and management interface

**Key Patterns**:
- Server Components for data fetching
- Client Components for interactivity
- Custom hooks for complex state (`hooks/`)
- Utility functions for business logic (`util/`)
- Type definitions matching backend (`types/`)

## Key Development Patterns

### Module Development
When creating new modules, follow the existing pattern:
1. Create models with proper decorators and relationships
2. Implement service class extending `AbstractModuleService`
3. Create migration files for schema changes
4. Export module in `index.ts` with service registration
5. Add module to `medusa-config.ts`

### API Route Development
- Use Zod for request validation
- Implement proper query configuration for list endpoints
- Apply appropriate middleware for authentication
- Follow RESTful patterns for resource operations

### Workflow Development
- Break complex operations into discrete steps
- Use proper error handling and compensation
- Implement workflows in `workflows/` directory
- Connect to API routes or event subscribers

### Frontend Component Development
- Use TypeScript with proper type definitions
- Follow existing component patterns and naming
- Implement proper loading and error states
- Use server components where possible for better performance

## Testing

The backend uses Jest with different test types:
- **Integration HTTP tests**: Test API endpoints end-to-end
- **Integration Module tests**: Test module services and workflows
- **Unit tests**: Test individual functions and utilities

Test files should follow naming conventions:
- `*.spec.ts` for integration tests
- `*.unit.spec.ts` for unit tests

## Environment Setup

### Required Environment Variables

**Backend (.env)**:
- `DATABASE_URL`: PostgreSQL connection string
- `ALGOLIA_APP_ID`, `ALGOLIA_API_KEY`: Search integration
- `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`: CORS configuration
- `JWT_SECRET`, `COOKIE_SECRET`: Security secrets

**Frontend (.env)**:
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`: API access token
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL`: Backend URL (default: http://localhost:9000)
- `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_API_KEY`: Search client config

## Key Dependencies

- **Medusa Framework 2.8.4**: Core commerce platform
- **MikroORM 6.4.3**: Database ORM with PostgreSQL
- **Next.js 15**: React framework with App Router
- **Algolia 5.34.1**: Search and discovery
- **Tailwind CSS**: Styling framework
- **Zod 3.22.4**: Runtime type validation
- **React Hook Form**: Form management
- **Medusa UI**: Component library for consistent styling