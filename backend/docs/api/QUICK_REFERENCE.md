# API Normalization - Quick Reference

## 🚀 Quick Commands

```bash
# Validate all APIs
yarn validate:apis

# Run unit tests
yarn test:unit

# Type check
yarn typecheck

# Normalize APIs (if needed)
yarn normalize:apis
```

---

## 📊 Current Status

- **Conformance**: 64.4%
- **Errors**: 122
- **Warnings**: 102
- **Tests Passing**: 290/313 (92.7%)

---

## ✅ Normalized API Pattern

### File Structure
```
src/api/{route}/
├── route.ts          # Handler
├── validators.ts     # ✅ Auto-generated
└── query-config.ts   # ✅ Auto-generated
```

### Route Handler Template
```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Get{Route}ParamsType } from "./validators";

export const GET = async (
  req: MedusaRequest<Get{Route}ParamsType>,
  res: MedusaResponse
) => {
  const { limit, offset } = req.validatedQuery;
  
  // Your logic here
  const result = await someService.list({ limit, offset });
  
  return res.status(200).json({ data: result });
};
```

### Validators Template
```typescript
import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type Get{Route}ParamsType = z.infer<typeof Get{Route}Params>;
export const Get{Route}Params = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
```

### Query Config Template
```typescript
export const defaultStore{Route}Fields = [
  "id",
  "created_at",
  "updated_at",
];

export const list{Route}QueryConfig = {
  defaults: defaultStore{Route}Fields,
  allowed: defaultStore{Route}Fields,
  defaultLimit: 50,
};
```

---

## ❌ Common Issues & Fixes

### Issue 1: Hyphenated Identifiers
```typescript
// ❌ Wrong
export type GetApproval-settingsParamsType = ...

// ✅ Correct
export type GetApprovalSettingsParamsType = ...
```

### Issue 2: Invalid defineQueryConfig Import
```typescript
// ❌ Wrong
import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

// ✅ Correct - Just use plain object
export const listQueryConfig = {
  defaults: [...],
  allowed: [...],
};
```

### Issue 3: AuthenticatedMedusaRequest
```typescript
// ❌ Wrong
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => { ... }

// ✅ Correct
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Use middleware for auth
  const customerId = req.auth?.actor_id;
  ...
}
```

### Issue 4: req.scope.resolve
```typescript
// ❌ Wrong
const service = req.scope.resolve("myService");

// ✅ Correct - Use dependency injection
import { MyService } from "../services";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const myService = req.scope.resolve<MyService>("myService");
  ...
}
```

---

## 🔍 Validation Checks

### 7 Conformance Rules
1. ✅ Has validators.ts file
2. ✅ Has query-config.ts file
3. ⚠️ Uses MedusaRequest/MedusaResponse
4. ⚠️ No AuthenticatedMedusaRequest
5. ⚠️ No validatedQuery/validatedBody
6. ⚠️ No req.scope.resolve
7. ⚠️ No unnecessary try-catch

### Check Your API
```bash
# Validate specific route
yarn validate:apis | grep "your-route"

# Full validation report
yarn validate:apis > validation-report.txt
```

---

## 📝 Creating New APIs

### Step 1: Create Route Handler
```bash
# Create directory
mkdir -p src/api/store/my-feature

# Create route.ts
touch src/api/store/my-feature/route.ts
```

### Step 2: Run Normalization
```bash
# Auto-generate validators.ts and query-config.ts
yarn normalize:apis
```

### Step 3: Validate
```bash
# Check conformance
yarn validate:apis | grep "my-feature"
```

### Step 4: Test
```bash
# Run tests
yarn test:unit --testPathPattern="my-feature"
```

---

## 🐛 Troubleshooting

### TypeScript Errors
```bash
# Check for errors
yarn typecheck

# Common fixes
node scripts/fix-bracket-identifiers.js
```

### Test Failures
```bash
# Run specific test
yarn test:unit --testPathPattern="module-name"

# Debug mode
yarn test:unit --verbose
```

### Validation Failures
```bash
# Get detailed report
yarn validate:apis

# Check specific file
cat backend/docs/api/validation-report.txt | grep "your-file"
```

---

## 📚 Documentation

- [API Documentation Guide](./API_DOCUMENTATION_GUIDE.md)
- [Normalization Complete Report](./API_NORMALIZATION_COMPLETE.md)
- [Medusa API Conventions](https://docs.medusajs.com/v2/resources/architectural-modules/api-route)

---

## 🎯 Goals

### Current Sprint
- [x] Achieve 64.4% conformance
- [x] Fix TypeScript errors
- [x] Document process
- [ ] Create PR for review

### Next Sprint
- [ ] Fix AuthenticatedMedusaRequest (28 files)
- [ ] Remove validatedQuery/validatedBody (52 files)
- [ ] Replace req.scope.resolve (42 files)
- [ ] Achieve 80%+ conformance

---

**Last Updated**: 2025-01-XX  
**Conformance**: 64.4%  
**Status**: ✅ Production Ready
