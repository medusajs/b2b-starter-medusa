# Backend APIs 360° - Quick Start Guide

**Quick reference for developers implementing standardized API patterns**

---

## 🚀 Using Standardized Response Envelopes

### Success Response

```typescript
import { APIResponse } from "../../utils/api-response";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const data = { id: 1, name: "Product" };
  
  // Simple success
  APIResponse.success(res, data);
  
  // With metadata
  APIResponse.success(res, data, { version: "1.0" });
  
  // With custom status
  APIResponse.success(res, data, undefined, 201);
}
```

### Paginated Response

```typescript
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const products = await productService.list({ limit: 50, offset: 0 });
  
  APIResponse.paginated(res, products.data, {
    limit: 50,
    offset: 0,
    count: products.data.length,
    total: products.total,
  });
}
```

### Error Responses

```typescript
// Validation error (400)
APIResponse.validationError(res, "Invalid email format", {
  field: "email",
  value: "invalid",
});

// Unauthorized (401)
APIResponse.unauthorized(res, "Invalid API key");

// Forbidden (403)
APIResponse.forbidden(res, "Insufficient permissions");

// Not found (404)
APIResponse.notFound(res, "Product not found");

// Rate limit (429)
APIResponse.rateLimit(res, 60, 100, new Date().toISOString());

// Internal error (500)
APIResponse.internalError(res, "Database connection failed");

// Custom error
APIResponse.error(res, "E409_CONFLICT", "Resource already exists", 409);
```

---

## 🛡️ Applying Rate Limiting

### Basic Usage

```typescript
import { rateLimitMiddleware } from "../../middlewares/solar-cv";

// Apply to route (100 requests per minute)
export const config = {
  middleware: [rateLimitMiddleware(100, 60000)],
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // Your route logic
}
```

### Predefined Configs

```typescript
import { RateLimiter } from "../../utils/rate-limiter";

// Strict: 10 req/min
rateLimitMiddleware(
  RateLimiter.STRICT.maxRequests,
  RateLimiter.STRICT.windowMs
);

// Moderate: 100 req/15min
rateLimitMiddleware(
  RateLimiter.MODERATE.maxRequests,
  RateLimiter.MODERATE.windowMs
);

// Lenient: 1000 req/hour
rateLimitMiddleware(
  RateLimiter.LENIENT.maxRequests,
  RateLimiter.LENIENT.windowMs
);

// API Heavy: 50 req/hour
rateLimitMiddleware(
  RateLimiter.API_HEAVY.maxRequests,
  RateLimiter.API_HEAVY.windowMs
);
```

---

## 🌐 CORS Configuration

### Environment Variables

```bash
# Development (allows wildcard)
NODE_ENV=development
CV_CORS_ORIGINS=*

# Production (explicit origins only)
NODE_ENV=production
CV_CORS_ORIGINS=https://app.yellosolarhub.com,https://admin.yellosolarhub.com
```

### Applying CORS Middleware

```typescript
import { cvCorsMiddleware } from "../../middlewares/solar-cv";

export const config = {
  middleware: [cvCorsMiddleware],
};
```

---

## 📝 Request ID & API Versioning

### Global Middlewares (Auto-Applied)

Request ID and API version middlewares are applied globally. No action needed.

### Accessing Request ID

```typescript
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const requestId = (req as any).requestId;
  console.log("Processing request:", requestId);
  
  // Request ID is automatically included in responses
  APIResponse.success(res, data);
}
```

### API Version Header

All responses automatically include `X-API-Version` header with current version.

---

## 📚 OpenAPI Documentation

### Adding Documentation to Routes

```typescript
/**
 * @swagger
 * /store/products:
 *   get:
 *     tags:
 *       - Catalog
 *     summary: List products
 *     description: Returns paginated list of products
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of products to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of products to skip
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // Route implementation
}
```

### Enabling Documentation

```bash
# Set environment variable
export ENABLE_API_DOCS=true

# Start server
npm run dev

# Access Swagger UI
http://localhost:9000/docs

# Get JSON spec
http://localhost:9000/docs?format=json
```

---

## 🧪 Writing Unit Tests

### Middleware Tests

```typescript
describe("My Middleware", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
      query: {},
      path: "/test",
      method: "GET",
    };
    mockRes = {
      setHeader: jest.fn(),
      getHeader: jest.fn().mockReturnValue("req-test-123"),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should process request", () => {
    myMiddleware(mockReq, mockRes, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
  });
});
```

### Running Tests

```powershell
# All unit tests
npm run test:unit

# Specific test file
npm run test:unit -- --testPathPattern="my-test"

# With coverage
npm run test:coverage
```

---

## 🔧 Common Patterns

### Complete Route Example

```typescript
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { APIResponse } from "../../utils/api-response";
import { rateLimitMiddleware } from "../../middlewares/solar-cv";
import { RateLimiter } from "../../utils/rate-limiter";

/**
 * @swagger
 * /store/my-resource:
 *   get:
 *     tags:
 *       - MyResource
 *     summary: Get resource
 *     responses:
 *       200:
 *         description: Success
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const service = req.scope.resolve("myService");
    
    const resource = await service.retrieve(id);
    
    if (!resource) {
      APIResponse.notFound(res, "Resource not found");
      return;
    }
    
    APIResponse.success(res, resource);
  } catch (error) {
    console.error("[MyResource] Error:", error);
    APIResponse.internalError(res, "Failed to retrieve resource");
  }
}

// Apply rate limiting
export const config = {
  middleware: [
    rateLimitMiddleware(
      RateLimiter.MODERATE.maxRequests,
      RateLimiter.MODERATE.windowMs
    ),
  ],
};
```

### Validation with Zod

```typescript
import { z } from "zod";
import { APIResponse } from "../../utils/api-response";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(18),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const validated = createSchema.parse(req.body);
    
    // Process validated data
    const result = await service.create(validated);
    
    APIResponse.success(res, result, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      APIResponse.validationError(res, "Validation failed", {
        errors: error.errors,
      });
      return;
    }
    
    APIResponse.internalError(res);
  }
}
```

---

## 📊 Error Codes Reference

| Code | Status | Description |
|------|--------|-------------|
| `E400_VALIDATION` | 400 | Validation failed |
| `E400_INVALID_INPUT` | 400 | Invalid input data |
| `E401_UNAUTHORIZED` | 401 | Authentication required |
| `E401_INVALID_TOKEN` | 401 | Invalid or expired token |
| `E403_FORBIDDEN` | 403 | Insufficient permissions |
| `E403_CORS` | 403 | CORS policy violation |
| `E404_NOT_FOUND` | 404 | Resource not found |
| `E409_CONFLICT` | 409 | Resource conflict |
| `E413_PAYLOAD_TOO_LARGE` | 413 | Request body too large |
| `E429_RATE_LIMIT` | 429 | Rate limit exceeded |
| `E500_INTERNAL` | 500 | Internal server error |
| `E502_BAD_GATEWAY` | 502 | Bad gateway |
| `E503_UNAVAILABLE` | 503 | Service unavailable |
| `E504_TIMEOUT` | 504 | Gateway timeout |

---

## 🎯 Checklist for New Routes

- [ ] Use `APIResponse` helpers for all responses
- [ ] Apply rate limiting if public-facing
- [ ] Add OpenAPI documentation (`@swagger` JSDoc)
- [ ] Validate input with Zod schemas
- [ ] Handle errors with try-catch
- [ ] Log errors with request context
- [ ] Write unit tests for route logic
- [ ] Test rate limiting behavior
- [ ] Verify CORS configuration
- [ ] Check response envelope format

---

## 📖 Additional Resources

- [Full Implementation Report](./BACKEND_APIS_360_IMPLEMENTATION.md)
- [API Response Utility](../../src/utils/api-response.ts)
- [Rate Limiter Utility](../../src/utils/rate-limiter.ts)
- [Global Middlewares](../../src/api/middlewares/global.ts)
- [Solar CV Middlewares](../../src/api/middlewares/solar-cv.ts)
- [OpenAPI Configuration](../../src/utils/swagger-config.ts)

---

**Questions?** Check the implementation report or existing route examples in `src/api/store/health/route.ts`
