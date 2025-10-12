import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Medusa B2B API Documentation",
            version: "2.10.3",
            description: `
# Medusa B2B Starter API

Complete API documentation for B2B e-commerce operations including:
- 🏢 Company Management
- 👥 Employee Management  
- 💬 Quote System
- ✅ Approval Workflows
- 🛒 Extended Cart Operations

## Authentication

Most endpoints require JWT authentication via cookies or Authorization header:

\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`

## API Sections

### Store API (\`/store/*\`)
Public and authenticated customer endpoints for:
- Company registration
- Quote requests
- Cart operations
- Order management

### Admin API (\`/admin/*\`)
Merchant/admin endpoints for:
- Quote responses
- Company approvals
- Order fulfillment
- System configuration
      `,
            contact: {
                name: "Yellow Solar Hub",
                url: "https://yellowsolar.com.br",
            },
            license: {
                name: "MIT",
                url: "https://opensource.org/licenses/MIT",
            },
        },
        servers: [
            {
                url: process.env.BACKEND_URL || "http://localhost:9000",
                description: "Development server",
            },
            {
                url: "https://api.yellowsolar.com.br",
                description: "Production server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "connect.sid",
                },
                publishableApiKey: {
                    type: "apiKey",
                    in: "header",
                    name: "x-publishable-api-key",
                },
            },
            schemas: {
                Company: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "comp_01HZQX..." },
                        name: { type: "string", example: "Solar Tech Solutions" },
                        email: { type: "string", format: "email" },
                        phone: { type: "string" },
                        currency_code: { type: "string", example: "BRL" },
                        spending_limit: { type: "integer", nullable: true },
                        spending_limit_reset_frequency: {
                            type: "string",
                            enum: ["never", "daily", "weekly", "monthly", "yearly"],
                        },
                        logo_url: { type: "string", format: "uri", nullable: true },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                    },
                },
                Employee: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "emp_01HZQX..." },
                        company_id: { type: "string" },
                        customer_id: { type: "string" },
                        spending_limit: { type: "integer", nullable: true },
                        spending_limit_reset_frequency: {
                            type: "string",
                            enum: ["never", "daily", "weekly", "monthly", "yearly"],
                        },
                        raw_spending_limit: { type: "object", nullable: true },
                        is_admin: { type: "boolean", default: false },
                        created_at: { type: "string", format: "date-time" },
                    },
                },
                Quote: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "quote_01HZQX..." },
                        draft_order_id: { type: "string" },
                        status: {
                            type: "string",
                            enum: ["pending", "merchant_accepted", "customer_accepted", "rejected"],
                        },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        type: { type: "string", example: "invalid_request_error" },
                        message: { type: "string", example: "Invalid parameter" },
                        code: { type: "string", example: "E400_VALIDATION" },
                    },
                },
            },
            responses: {
                Unauthorized: {
                    description: "Authentication required or invalid token",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                        },
                    },
                },
                Forbidden: {
                    description: "Insufficient permissions",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                        },
                    },
                },
                NotFound: {
                    description: "Resource not found",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                        },
                    },
                },
                ValidationError: {
                    description: "Invalid request data",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: "Companies",
                description: "Company management endpoints",
            },
            {
                name: "Employees",
                description: "Employee operations within companies",
            },
            {
                name: "Quotes",
                description: "Quote request and response system",
            },
            {
                name: "Approvals",
                description: "Purchase approval workflows",
            },
            {
                name: "Cart",
                description: "Extended cart operations for B2B",
            },
        ],
    },
    apis: [
        "./src/api/store/**/*.ts",
        "./src/api/admin/**/*.ts",
        "./src/api/middlewares/**/*.ts",
    ],
};

export const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI for API documentation
 * @param app Express application
 */
export function setupSwagger(app: Express) {
    const isDevelopment = process.env.NODE_ENV !== "production";

    // Serve Swagger UI only in development (or if explicitly enabled)
    if (isDevelopment || process.env.ENABLE_API_DOCS === "true") {
        app.use(
            "/docs",
            swaggerUi.serve,
            swaggerUi.setup(swaggerSpec, {
                customCss: ".swagger-ui .topbar { display: none }",
                customSiteTitle: "Medusa B2B API Documentation",
                customfavIcon: "/favicon.ico",
            })
        );

        // Serve raw OpenAPI spec as JSON
        app.get("/docs.json", (req, res) => {
            res.setHeader("Content-Type", "application/json");
            res.send(swaggerSpec);
        });

        console.log(`📚 API Documentation available at ${process.env.BACKEND_URL || "http://localhost:9000"}/docs`);
    }
}
