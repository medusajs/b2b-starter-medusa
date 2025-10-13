/**
 * 📚 OpenAPI/Swagger Configuration
 * API documentation setup with swagger-jsdoc
 */

import swaggerJsdoc from "swagger-jsdoc";
import { APIVersionManager } from "./api-versioning";

// ============================================================================
// OpenAPI Specification
// ============================================================================

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "YSH Solar Hub API",
    version: APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION),
    description: "B2B Solar Commerce API - Medusa 2.10.3",
    contact: {
      name: "YSH Solar Hub",
      url: "https://yellosolarhub.com",
    },
  },
  servers: [
    {
      url: process.env.BACKEND_URL || "http://localhost:9000",
      description: "API Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      apiKey: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
      },
    },
    schemas: {
      SuccessResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          data: {
            type: "object",
            description: "Response data",
          },
          meta: {
            type: "object",
            description: "Metadata (pagination, etc.)",
          },
          request_id: {
            type: "string",
            example: "req-1234567890-abc123",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: {
                type: "string",
                example: "E400_VALIDATION",
              },
              message: {
                type: "string",
                example: "Validation failed",
              },
              details: {
                type: "object",
                description: "Additional error details",
              },
              request_id: {
                type: "string",
                example: "req-1234567890-abc123",
              },
              timestamp: {
                type: "string",
                format: "date-time",
              },
            },
          },
        },
      },
      PaginationMeta: {
        type: "object",
        required: ["limit", "count", "total"],
        properties: {
          limit: {
            type: "integer",
            example: 50,
          },
          offset: {
            type: "integer",
            example: 0,
          },
          page: {
            type: "integer",
            example: 1,
          },
          count: {
            type: "integer",
            example: 25,
          },
          total: {
            type: "integer",
            example: 100,
          },
        },
      },
      HealthCheck: {
        type: "object",
        properties: {
          timestamp: {
            type: "string",
            format: "date-time",
          },
          overall_status: {
            type: "string",
            enum: ["healthy", "degraded", "unavailable"],
          },
          version: {
            type: "string",
            example: "v2.10.3",
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "Bad Request",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
      Unauthorized: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
      Forbidden: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
      NotFound: {
        description: "Not Found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
      RateLimitExceeded: {
        description: "Rate Limit Exceeded",
        headers: {
          "Retry-After": {
            schema: {
              type: "integer",
            },
            description: "Seconds until rate limit resets",
          },
        },
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
      InternalServerError: {
        description: "Internal Server Error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
    },
    parameters: {
      RequestId: {
        name: "X-Request-ID",
        in: "header",
        description: "Unique request identifier",
        schema: {
          type: "string",
        },
      },
      APIVersion: {
        name: "X-API-Version",
        in: "header",
        description: "API version",
        schema: {
          type: "string",
          example: "v2.10.3",
        },
      },
    },
  },
  tags: [
    {
      name: "Health",
      description: "Health check endpoints",
    },
    {
      name: "Quotes",
      description: "Quote management (B2B)",
    },
    {
      name: "Companies",
      description: "Company management (B2B)",
    },
    {
      name: "Catalog",
      description: "Product catalog",
    },
    {
      name: "Solar",
      description: "Solar-specific APIs",
    },
  ],
};

// ============================================================================
// Swagger Options
// ============================================================================

const swaggerOptions: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [
    "./src/api/store/health/route.ts",
    "./src/api/store/quotes/route.ts",
    "./src/api/store/companies/route.ts",
    "./src/api/store/catalog/route.ts",
    "./src/api/solar/**/*.ts",
    "./src/api/store/**/*.ts",
  ],
};

// ============================================================================
// Generate Swagger Spec
// ============================================================================

export function generateSwaggerSpec() {
  return swaggerJsdoc(swaggerOptions);
}

// ============================================================================
// Swagger UI Options
// ============================================================================

export const swaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "YSH Solar Hub API Docs",
};
