# 🔧 YSH Monorepo Governance Guide

## Overview

This document outlines the governance standards, conventions, and processes for the YSH Medusa monorepo. It ensures consistency between the server (Medusa) and client (Next.js) workspaces while maintaining high code quality and developer experience.

## 🏗️ Architecture

### Workspaces

- **`server/`**: Medusa v2 backend with custom B2B modules
- **`client/`**: Next.js 15+ frontend with Pages Router
- **`root/`**: Shared tooling, configs, and automation

### Technologies

- **Framework**: Next.js 15+ (Pages Router), Medusa v2
- **Language**: TypeScript with strict mode
- **Linting**: ESLint with workspace-specific rules
- **Formatting**: Prettier with consistent style
- **Package Manager**: Yarn 4 with workspaces

## 📋 Standards & Conventions

### Code Organization

#### Absolute Imports

```typescript
// ✅ Good
import { useSolarCalculator } from 'src/hooks/use-solar-calculator';

// ❌ Bad
import { useSolarCalculator } from '../../../hooks/use-solar-calculator';
```

#### File Structure

```text
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Next.js pages (Pages Router)
│   ├── lib/           # Utilities, configs, data fetching
│   ├── hooks/         # Custom React hooks
│   ├── stores/        # Zustand stores
│   ├── types/         # TypeScript type definitions
│   └── styles/        # Global styles
```

### Naming Conventions

#### Components

```typescript
// PascalCase for component files
SolarCalculatorCard.tsx
ProductGrid.tsx
```

#### Hooks

```typescript
// camelCase with 'use' prefix
useSolarCalculator.ts
useAuth.ts
```

#### Types

```typescript
// PascalCase with descriptive names
SolarCalculatorInput.ts
ProductVariant.ts
```

### TypeScript Standards

#### Strict Mode Enabled

- `noImplicitAny: true`
- `strictNullChecks: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`

#### Interface vs Type

```typescript
// Use interfaces for object shapes
interface Product {
  id: string;
  name: string;
}

// Use types for unions and primitives
type ProductStatus = 'active' | 'inactive';
```

### React Patterns

#### Server Components (Default)

```typescript
// server-component.tsx
export default function ProductList() {
  const products = await fetchProducts();
  return <div>{/* JSX */}</div>;
}
```

#### Client Components (When Needed)

```typescript
// client-component.tsx
'use client';

import { useState } from 'react';

export default function InteractiveForm() {
  const [state, setState] = useState();
  // Client-side logic
}
```

## 🛠️ Development Workflow

### 1. Environment Setup

```bash
# Install dependencies
yarn install

# Copy environment files
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 2. Development

```bash
# Start development servers
yarn dev          # Both workspaces
yarn dev:server   # Server only
yarn dev:client   # Client only
```

### 3. Quality Checks

```bash
# Run all checks
yarn pr-check

# Individual checks
yarn lint         # ESLint
yarn format       # Prettier
yarn typecheck    # TypeScript
```

### 4. Testing

```bash
# Unit tests
yarn test:unit

# Integration tests
yarn test:integration

# E2E tests
yarn test:e2e
```

## 🔍 Quality Gates

### Pre-commit Hooks

- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Import checks**: Absolute imports only

### PR Requirements

- ✅ All quality checks pass
- ✅ Tests added/updated for new features
- ✅ Documentation updated
- ✅ Environment variables documented
- ✅ Breaking changes flagged

### Automated Checks

```bash
# Run compatibility report for Commerce/Infra changes
node scripts/compatibility-report.js <changed-files...>

# Full PR validation
yarn pr-check
```

## 📦 Dependency Management

### Adding Dependencies

```bash
# Root dependencies
yarn add -D eslint prettier

# Workspace-specific
yarn workspace client add react-query
yarn workspace server add @medusajs/medusa
```

### Version Pinning

- **Production**: Exact versions (`^1.2.3` → `1.2.3`)
- **Development**: Caret ranges for patch updates
- **Peer dependencies**: Match exactly

## 🚀 Deployment

### Environment Variables

- **Root**: Shared secrets and configs
- **Server**: Medusa-specific settings
- **Client**: Public Next.js variables

### Build Process

```bash
# Production build
yarn build

# Docker build
docker-compose build
```

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Calculates solar panel requirements
 * @param input - User input parameters
 * @returns Calculation results
 */
export function calculateSolarRequirements(input: SolarInput): SolarResult {
  // Implementation
}
```

### API Documentation

- OpenAPI specs in `server/docs/`
- Client SDK documentation in `client/docs/`

## 🔒 Security

### Secrets Management

- Never commit secrets to git
- Use environment variables
- Rotate keys regularly

### Code Security

- Input validation on all APIs
- SQL injection prevention
- XSS protection in templates

## 🤝 Contributing

### Issue Templates

- **Bug Report**: Detailed reproduction steps
- **Feature Request**: Clear requirements and use cases
- **Security Issue**: Private reporting process

### PR Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Run quality checks
4. Create PR with detailed description
5. Code review and approval
6. Merge after checks pass

### Commit Convention

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scopes: client, server, shared, ci, etc.
```

## 📊 Monitoring & Maintenance

### Health Checks

- Application health endpoints
- Database connection monitoring
- External service dependencies

### Performance

- Bundle size monitoring
- API response times
- Database query optimization

### Updates

- Regular dependency updates
- Security patch management
- Framework version upgrades

## 🆘 Troubleshooting

### Common Issues

- **Import errors**: Check absolute import paths
- **Type errors**: Run `yarn typecheck`
- **Lint errors**: Run `yarn lint --fix`

### Getting Help

- Check existing issues/PRs
- Review documentation
- Ask in development channels

---

## 📞 Contact

For questions about these standards, contact the platform team or create an issue with the `question` label.
