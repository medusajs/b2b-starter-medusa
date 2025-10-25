import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { linkCustomerGroupStep } from "./steps/link-customer-group-step";
import { checkSpendingLimitsStep } from "./steps/check-spending-limits-step";
import { createApprovalStep } from "./steps/create-approval-step";

export interface CreateFinancingProposalWorkflowInput {
  customer_id: string;
  quote_id?: string;
  modality: "CDC" | "LEASING" | "EAAS";
  requested_amount: number;
  requested_term_months: number;
  down_payment_amount?: number;
  amortization_system?: "PRICE" | "SAC";
}

export const createFinancingProposalWorkflow = createWorkflow(
  "create-financing-proposal",
  function (input: CreateFinancingProposalWorkflowInput) {
    // 1. Check spending limits
    const spendingCheck = checkSpendingLimitsStep({
      customer_id: input.customer_id,
      requested_amount: input.requested_amount,
    });

    // 2. Link to customer group
    const customerGroupLink = linkCustomerGroupStep({
      customer_id: input.customer_id,
      financing_proposal_id: "temp", // Will be updated after creation
    });

    // 3. Create approval request for high-value proposals
    const approval = createApprovalStep({
      financing_proposal_id: "temp", // Will be updated after creation
      customer_id: input.customer_id,
      requested_amount: input.requested_amount,
      type: "financing_proposal",
    });

    return new WorkflowResponse({
      spending_check: spendingCheck,
      customer_group_link: customerGroupLink,
      approval: approval,
    });
  }
);