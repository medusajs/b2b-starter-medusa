import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { customerAcceptQuoteWorkflow } from "../../workflows/quote.disabled/workflows/customer-accept-quote";

/**
 * GET /quotes/{id}
 * Retrieve single quote
 */
export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { id } = req.params;

    // Check access
    if (!req.isAdmin) {
        // Verify user has access to this quote
        const { data: [quote] } = await query.graph({
            entity: "quote",
            fields: ["customer_id", "customer.employee.company_id"],
            filters: { id }
        });

        if (!quote) {
            return res.status(404).json({ message: "Quote not found" });
        }

        // Check if user is the quote owner or company member
        const isOwner = quote.customer_id === req.auth_context?.actor_id;
        const isCompanyMember = quote.customer?.employee?.company_id === req.companyId;

        if (!isOwner && !isCompanyMember) {
            return res.status(403).json({ message: "Access denied to this quote" });
        }
    }

    const { data } = await query.graph(
        {
            entity: "quotes",
            fields: req.queryConfig.fields,
            filters: { id },
        },
        { throwIfKeyNotFound: true }
    );

    res.json({ quote: data[0] });
};

/**
 * POST /quotes/{id}/accept
 * Accept quote
 */
export const accept = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { id } = req.params;

    // Verify user can accept this quote
    const { data: [quote] } = await query.graph({
        entity: "quote",
        fields: ["customer_id"],
        filters: { id }
    });

    if (quote.customer_id !== req.auth_context?.actor_id) {
        return res.status(403).json({ message: "Only quote owner can accept it" });
    }

    await customerAcceptQuoteWorkflow(req.scope).run({
        input: {
            quote_id: id,
            customer_id: req.auth_context.actor_id,
        },
    });

    const {
        data: [updatedQuote],
    } = await query.graph(
        {
            entity: "quotes",
            fields: req.queryConfig.fields,
            filters: { id },
        },
        { throwIfKeyNotFound: true }
    );

    return res.json({ quote: updatedQuote });
};