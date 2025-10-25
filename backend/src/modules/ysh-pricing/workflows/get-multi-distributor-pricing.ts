import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { getMultiDistributorPricingStep } from "./steps/get-multi-distributor-pricing-step";

export type GetMultiDistributorPricingInput = {
    variant_id: string;
    currency_code?: string;
    company_name?: string;
};

/**
 * Workflow: Get Multi-Distributor Pricing
 * Retrieves pricing from all available distributors for a variant
 */
export const getMultiDistributorPricingWorkflow = createWorkflow(
    "get-multi-distributor-pricing",
    (input: GetMultiDistributorPricingInput) => {
        const pricing = getMultiDistributorPricingStep(input);

        return new WorkflowResponse(pricing);
    }
);
