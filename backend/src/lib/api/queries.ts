import { MedusaRequest } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AuthContext } from "./types";

/**
 * Query Utilities
 */

/**
 * Get query service from request scope
 */
export const getQueryService = (req: MedusaRequest) => {
    return req.scope.resolve(ContainerRegistrationKeys.QUERY);
};

/**
 * Build company access filters based on auth context
 */
export const buildCompanyFilters = (auth: AuthContext) => {
    if (auth.isAdmin) {
        return {}; // Admin can see all companies
    }

    if (auth.companyId) {
        return { id: auth.companyId }; // Company member can see their company
    }

    return { id: null }; // No access
};

/**
 * Build quote access filters based on auth context
 */
export const buildQuoteFilters = (auth: AuthContext, additionalFilters: Record<string, unknown> = {}) => {
    if (auth.isAdmin) {
        return additionalFilters; // Admin can see all quotes
    }

    // For non-admin users, they can see quotes where they are the customer
    // or quotes from their company
    return {
        ...additionalFilters,
        $or: [
            { customer_id: auth.customerId },
            {
                customer: {
                    employee: {
                        company_id: auth.companyId
                    }
                }
            }
        ]
    };
};

/**
 * Execute graph query with error handling
 */
export const executeGraphQuery = async (
    req: MedusaRequest,
    config: {
        entity: string;
        fields: string[];
        filters?: Record<string, unknown>;
        pagination?: {
            skip?: number;
            take?: number;
        };
    }
) => {
    const query = getQueryService(req);

    try {
        const result = await query.graph({
            entity: config.entity,
            fields: config.fields,
            filters: config.filters,
            pagination: config.pagination,
        });

        return result;
    } catch (error) {
        console.error(`Graph query error for entity ${config.entity}:`, error);
        throw error;
    }
};

/**
 * Get paginated results with metadata
 */
export const getPaginatedResults = async (
    req: MedusaRequest,
    config: {
        entity: string;
        fields: string[];
        filters?: Record<string, unknown>;
        limit?: number;
        offset?: number;
    }
) => {
    const { limit = 50, offset = 0, ...queryConfig } = config;

    const result = await executeGraphQuery(req, {
        ...queryConfig,
        pagination: {
            skip: offset,
            take: limit,
        },
    });

    return {
        data: result.data,
        count: result.data.length,
        limit,
        offset,
        // Note: Medusa doesn't provide total count in graph queries
        // You might need to use raw queries for accurate pagination metadata
    };
};