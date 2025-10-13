/**
 * Unified Companies API
 * GET/POST /companies
 *
 * Consolidated endpoint that replaces:
 * - /store/companies (deprecated)
 * - /admin/companies (deprecated)
 *
 * Uses role-based authorization:
 * - Company members can access their own company data
 * - Admins can access all companies
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createCompaniesWorkflow } from "../../workflows/company/workflows/create-companies";
import { StoreCreateCompanyType } from "../store/companies/validators";
import { AdminCreateCompanyType } from "../admin/companies/validators";

/**
 * Middleware to check company access based on role
 */
export const requireCompanyAccess = async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: any
) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
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
 * GET /companies
 * List companies based on user role
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    let filters: any = {};
    let fields = req.queryConfig?.fields || [
        "id", "name", "email", "created_at", "updated_at"
    ];

    if (req.isAdmin) {
        // Admin can see all companies
        filters = req.filterableFields || {};
    } else {
        // Company member can only see their company
        filters = { id: req.companyId };
        // Add employee info for company members
        fields.push("*employees");
    }

    const { data: companies, metadata } = await query.graph({
        entity: "companies",
        fields,
        filters,
        pagination: req.queryConfig?.pagination,
    });

    res.json({
        companies,
        count: metadata!.count,
        offset: metadata!.skip,
        limit: metadata!.take,
    });
};

/**
 * POST /companies
 * Create company (admin only)
 */
export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    // Only admins can create companies
    if (!req.isAdmin) {
        return res.status(403).json({ message: "Admin access required to create companies" });
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const { result: createdCompanies } = await createCompaniesWorkflow.run({
        input: Array.isArray(req.validatedBody)
            ? req.validatedBody.map((company: any) => ({ ...company }))
            : [{ ...req.validatedBody }],
        container: req.scope,
    });

    const { data: companies } = await query.graph(
        {
            entity: "companies",
            fields: req.queryConfig?.fields || ["id", "name", "email", "created_at"],
            filters: { id: createdCompanies.map((company: any) => company.id) },
        },
        { throwIfKeyNotFound: true }
    );

    res.json({ companies });
};