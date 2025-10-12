import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { YSH_PRICING_MODULE } from "../../index";

export type GetMultiDistributorPricingStepInput = {
    variant_id: string;
    currency_code?: string;
    company_name?: string;
};

/**
 * Step: Get Multi-Distributor Pricing
 * Retrieves pricing tiers from all distributors for a variant
 */
export const getMultiDistributorPricingStep = createStep(
    "get-multi-distributor-pricing-step",
    async (input: GetMultiDistributorPricingStepInput, { container }) => {
        const { variant_id, currency_code = "BRL", company_name } = input;

        const yshPricingService = container.resolve(YSH_PRICING_MODULE);

        const pricing = await (yshPricingService as any).getMultiDistributorPricing(
            variant_id,
            currency_code,
            company_name
        );

        if (!pricing) {
            throw new Error(`No pricing found for variant ${variant_id}`);
        }

        return new StepResponse(pricing);
    }
);
