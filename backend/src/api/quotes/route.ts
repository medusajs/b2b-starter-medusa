/**
 * Unified Quotes API
 * GET/POST /quotes
 *
 * Consolidated endpoint that replaces:
 * - /store/quotes (deprecated)
 * - /admin/quotes (deprecated)
 *
 * Uses role-based authorization:
 * - Company members can access their company's quotes
 * - Admins can access all quotes
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { RemoteQueryFunction } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createRequestForQuoteWorkflow } from "../../workflows/quote/workflows/create-request-for-quote";

/**
 * Middleware to check quotes access based on role
 */
export const requireQuotesAccess = async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: (error?: Error) => void
) => {
    const query = req.scope.resolve<RemoteQueryFunction>(ContainerRegistrationKeys.QUERY);
    const customerId = req.auth_context?.actor_id;

    if (!customerId) {
        return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user is admin
    const { data: [user] } = await query.graph({
        entity: "customer",
        fields: ["role"],
        filters: { id: customerId }
    });

    if (user?.role === "admin") {
        req.isAdmin = true;
        req.companyId = null; // Admin can access all
        return next();
    }

    // Check if user is company member
    const { data: [employee] } = await query.graph({
        entity: "employee",
        fields: ["company_id", "is_admin"],
        filters: { customer_id: customerId }
    });

    if (!employee?.company_id) {
        return res.status(403).json({ message: "Company membership required" });
    }

    req.isAdmin = false;
    req.companyId = employee.company_id;
    req.employee = employee;
    next();
};

/**
 * GET /quotes
 * List quotes based on user role
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve<RemoteQueryFunction>(
        ContainerRegistrationKeys.QUERY
    );

    const { fields, pagination } = req.queryConfig;
    let filters: Record<string, unknown> = {};

    if (req.isAdmin) {
        // Admin can see all quotes
        filters = req.filterableFields || {};
    } else {
        // Company member can only see quotes from their company
        filters = {
            "customer.employee.company_id": req.companyId,
        };
    }

    const { data: quotes, metadata } = await query.graph({
        entity: "quote",
        fields,
        filters,
        pagination: {
            ...pagination,
            skip: pagination.skip ?? 0,
        },
    });

    res.json({
        quotes,
        count: metadata?.count ?? 0,
        offset: metadata?.skip ?? 0,
        limit: metadata?.take ?? 0,
    });
};

/**
 * POST /quotes
 * Create quote request
 */
export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve<RemoteQueryFunction>(
        ContainerRegistrationKeys.QUERY
    );

    const {
        result: { quote: createdQuote },
    } = await createRequestForQuoteWorkflow(req.scope).run({
        input: {
            cart_id: req.validatedBody.cart_id || "",
            customer_id: req.auth_context.actor_id,
        },
    });

    const {
        data: [quote],
    } = await query.graph(
        {
            entity: "quote",
            fields: req.queryConfig.fields,
            filters: { id: createdQuote.id },
        },
        { throwIfKeyNotFound: true }
    );

    res.json({ quote });
};