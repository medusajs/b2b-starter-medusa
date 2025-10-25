# 📦 API Response Envelope - Quick Reference

## Import

```typescript
import { APIResponse } from "../../../utils/api-response";
```

## Success Responses

### Simple Success
```typescript
APIResponse.success(res, data);
// Status: 200
// { success: true, data: {...}, request_id: "..." }
```

### Success with Metadata
```typescript
APIResponse.success(res, data, { cached: true, ttl: 3600 });
// { success: true, data: {...}, meta: { cached: true, ttl: 3600 }, request_id: "..." }
```

### Created (201)
```typescript
APIResponse.success(res, newResource, undefined, 201);
// Status: 201
```

### Paginated Response
```typescript
APIResponse.paginated(res, items, {
  count: 10,
  offset: 0,
  limit: 20,
  total: 100,
});
// { success: true, data: [...], meta: { count, offset, limit, total }, request_id: "..." }
```

## Error Responses

### Validation Error (400)
```typescript
APIResponse.validationError(res, "Invalid input", {
  field: "email",
  reason: "Invalid format"
});
// Status: 400
// { success: false, error: { code: "E400_VALIDATION", message: "...", details: {...} } }
```

### Unauthorized (401)
```typescript
APIResponse.unauthorized(res);
// Status: 401
// { success: false, error: { code: "E401_UNAUTHORIZED", message: "Unauthorized" } }
```

### Forbidden (403)
```typescript
APIResponse.forbidden(res, "Insufficient permissions");
// Status: 403
```

### Not Found (404)
```typescript
APIResponse.notFound(res, "Quote not found");
// Status: 404
// { success: false, error: { code: "E404_NOT_FOUND", message: "Quote not found" } }
```

### Rate Limit (429)
```typescript
APIResponse.rateLimit(res, 60, 100, "2024-01-15T11:00:00Z");
// Status: 429
// Headers: Retry-After: 60
// { success: false, error: { code: "E429_RATE_LIMIT", details: { retry_after: 60, limit: 100 } } }
```

### Internal Error (500)
```typescript
APIResponse.internalError(res, "Database connection failed");
// Status: 500
```

### Service Unavailable (503)
```typescript
APIResponse.serviceUnavailable(res, "Maintenance in progress");
// Status: 503
```

## Custom Error
```typescript
APIResponse.error(res, "CUSTOM_ERROR_CODE", "Custom message", 418, { extra: "data" });
```

## Error Codes Reference

| Code | HTTP | Description |
|------|------|-------------|
| `E400_VALIDATION` | 400 | Validation failed |
| `E400_INVALID_INPUT` | 400 | Invalid input data |
| `E401_UNAUTHORIZED` | 401 | Authentication required |
| `E401_INVALID_TOKEN` | 401 | Invalid auth token |
| `E403_FORBIDDEN` | 403 | Insufficient permissions |
| `E403_CORS` | 403 | CORS policy violation |
| `E404_NOT_FOUND` | 404 | Resource not found |
| `E409_CONFLICT` | 409 | Resource conflict |
| `E413_PAYLOAD_TOO_LARGE` | 413 | Request too large |
| `E429_RATE_LIMIT` | 429 | Rate limit exceeded |
| `E500_INTERNAL` | 500 | Internal server error |
| `E502_BAD_GATEWAY` | 502 | Upstream service error |
| `E503_UNAVAILABLE` | 503 | Service unavailable |
| `E504_TIMEOUT` | 504 | Request timeout |

## Complete Example

```typescript
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { APIResponse } from "../../../utils/api-response";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Validate input
    if (!req.query.id) {
      APIResponse.validationError(res, "ID is required");
      return;
    }

    // Fetch data
    const quote = await fetchQuote(req.query.id);
    
    if (!quote) {
      APIResponse.notFound(res, `Quote ${req.query.id} not found`);
      return;
    }

    // Success
    APIResponse.success(res, quote, {
      cached: false,
      response_time_ms: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Error fetching quote:", error);
    APIResponse.internalError(res, "Failed to fetch quote");
  }
}
```

## Migration Guide

### Before
```typescript
res.json({ quotes, count, offset, limit });
```

### After
```typescript
APIResponse.paginated(res, quotes, { count, offset, limit, total: count });
```

---

### Before
```typescript
res.status(404).json({ error: "Not found" });
```

### After
```typescript
APIResponse.notFound(res, "Resource not found");
```

---

### Before
```typescript
res.status(400).json({ error: "Invalid input", details: errors });
```

### After
```typescript
APIResponse.validationError(res, "Invalid input", errors);
```

## Benefits

✅ **Consistent**: Same format across all endpoints  
✅ **Type-safe**: Full TypeScript support  
✅ **Traceable**: Automatic request_id injection  
✅ **Documented**: Standardized error codes  
✅ **Testable**: Predictable response structure  

## See Also

- [API Response Implementation](../../src/utils/api-response.ts)
- [Global Middlewares](../../src/api/middlewares/global.ts)
- [Pact Provider Guide](./PACT_PROVIDER_GUIDE.md)
