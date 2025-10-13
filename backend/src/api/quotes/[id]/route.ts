import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
    confirmOrderEditRequestWorkflow,
    useRemoteQueryStep,
} from "@medusajs/core-flows";
import { OrderStatus } from "@medusajs/framework/utils";
import { createWorkflow } from "@medusajs/workflows-sdk";

// Inline workflow definition to avoid import issues
const customerAcceptQuoteWorkflow = createWorkflow(
    "customer-accept-quote-workflow",
    function (input: { quote_id: string; customer_id: string }) {
        const quote = useRemoteQueryStep({
            entry_point: "quote",
            fields: ["id", "draft_order_id", "status"],
            variables: { id: input.quote_id },
            list: false,
            throw_if_key_not_found: true,
        });

        // Note: validateQuoteAcceptanceStep and updateQuotesWorkflow are not available
        // Skipping validation for now

        confirmOrderEditRequestWorkflow.runAsStep({
            input: {
                order_id: quote.draft_order_id,
                confirmed_by: input.customer_id,
            },
        });

        // Simplified order update - will need proper workflow later
        // updateOrderWorkflow.runAsStep({
        //   input: {
        //     id: quote.draft_order_id,
        //     is_draft_order: false,
        //     status: OrderStatus.PENDING,
        //   },
        // });
    }
);/**
 * GET /quotes/{id}
 * Retrieve single quote
 */
export const GET = async (
    req: AuthenticatedMedusaRequest,
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