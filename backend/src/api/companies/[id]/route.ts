import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
    deleteCompaniesWorkflow,
    updateCompaniesWorkflow,
} from "../../workflows/company/workflows/";/**
 * GET /companies/{id}
 * Retrieve single company
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { id } = req.params;

    // Check access
    if (!req.isAdmin && req.companyId !== id) {
        return res.status(403).json({ message: "Access denied to this company" });
    }

    const { data } = await query.graph(
        {
            entity: "companies",
            fields: req.queryConfig.fields,
            filters: { id },
        },
        { throwIfKeyNotFound: true }
    );

    res.json({ company: data[0] });
};

/**
 * POST /companies/{id}
 * Update company
 */
export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { id } = req.params;

    // Check access - only admins or company admins can update
    if (!req.isAdmin && req.companyId !== id) {
        return res.status(403).json({ message: "Access denied to update this company" });
    }

    // Additional check for company members - must be admin of the company
    if (!req.isAdmin && !req.employee?.is_admin) {
        return res.status(403).json({ message: "Company admin access required" });
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    await updateCompaniesWorkflow.run({
        input: {
            id,
            ...req.validatedBody,
        },
        container: req.scope,
    });

    const {
        data: [company],
    } = await query.graph(
        {
            entity: "companies",
            fields: req.queryConfig.fields,
            filters: { id },
        },
        { throwIfKeyNotFound: true }
    );

    res.json({ company });
};

/**
 * DELETE /companies/{id}
 * Delete company (admin only)
 */
export const DELETE = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { id } = req.params;

    // Only admins can delete companies
    if (!req.isAdmin) {
        return res.status(403).json({ message: "Admin access required to delete companies" });
    }

    await deleteCompaniesWorkflow.run({
        input: { id },
        container: req.scope,
        throwOnError: true,
    });

    res.status(204).send();
};