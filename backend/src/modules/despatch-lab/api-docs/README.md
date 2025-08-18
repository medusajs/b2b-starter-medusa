# DespatchLab API Documentation

This directory contains the OpenAPI 3.0 specification for the DespatchLab API, organized into modular files for better maintainability.

## Structure

```
api-docs/
├── openapi.yaml              # Main OpenAPI specification file
├── paths/                    # API endpoint definitions
│   ├── authentication.yaml  # Authentication endpoints (3 endpoints)
│   ├── product-types.yaml   # Product type lookup endpoints
│   ├── products.yaml        # Product management endpoints
│   ├── customers.yaml       # Customer management endpoints
│   ├── orders.yaml          # Order management endpoints
│   ├── shipments.yaml       # Shipment tracking endpoints
│   └── invoices.yaml        # Invoice and billing endpoints
├── components/              # Reusable components
│   ├── schemas/            # Data model definitions
│   ├── responses/          # Common response definitions
│   └── parameters/         # Reusable parameter definitions
└── README.md               # This file
```

## API Overview

**Base URL**: `https://api.despatchlab.tech/v1`

### Authentication
The API uses JWT Bearer token authentication. Authentication endpoints include:
- `POST /auth/token/credentials` - Login with username/password
- `POST /core/impersonation/impersonate` - Impersonate a customer
- `POST /auth/token/refresh` - Refresh access token

### Main Features
- **Product Management**: Product catalog with types and stock information
- **Customer Management**: Customer profiles with approval status
- **Order Management**: Order processing and tracking
- **Shipment Tracking**: Shipment status and logistics
- **Invoice Management**: Billing and invoice downloads

## Usage

### Viewing the Documentation
You can use various tools to view and interact with this OpenAPI specification:

1. **Swagger UI**: Load `openapi.yaml` in Swagger UI for interactive documentation
2. **Redoc**: Use Redoc for a clean, readable documentation format
3. **Postman**: Import the OpenAPI spec into Postman for API testing
4. **VS Code**: Use OpenAPI extensions for editing and validation

### Development Notes
- All path files are referenced from the main `openapi.yaml` using `$ref`
- Common components are shared across endpoints for consistency
- TODO comments indicate where actual API response schemas need to be defined
- Security is configured globally with Bearer token authentication

### Extending the Documentation
When adding new endpoints:
1. Create or update the appropriate path file in `paths/`
2. Add the path reference to `openapi.yaml`
3. Define any new schemas in `components/schemas/`
4. Add reusable parameters to `components/parameters/`
5. Update this README if adding new sections

## Source
This documentation was generated from the DespatchLab Postman collection, providing a foundation for API integration and client SDK generation.