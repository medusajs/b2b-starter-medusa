import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
    deleteCompaniesWorkflow,
    updateCompaniesWorkflow,
} from "../../workflows/company/workflows/";
import { APIResponse } from "../../utils/api-response";/**
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
        return APIResponse.forbidden(res, "Access denied to this company");
    }

    const { data } = await query.graph(
        {
            entity: "companies",
            fields: req.queryConfig.fields,
            filters: { id },
        },
        { throwIfKeyNotFound: true }
    );

    APIResponse.success(res, { company: data[0] });
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
        return APIResponse.forbidden(res, "Access denied to update this company");
    }

    // Additional check for company members - must be admin of the company
    if (!req.isAdmin && !req.employee?.is_admin) {
        return APIResponse.forbidden(res, "Company admin access required");
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

    APIResponse.success(res, { company });
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
        return APIResponse.forbidden(res, "Admin access required to delete companies");
    }

    await deleteCompaniesWorkflow.run({
        input: { id },
        container: req.scope,
        throwOnError: true,
    });

    APIResponse.success(res, null, undefined, 204);
};