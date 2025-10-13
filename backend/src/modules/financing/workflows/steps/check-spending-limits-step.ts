import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../empresa";
import { ICompanyModuleService } from "../../../../types/company/service";

export interface CheckSpendingLimitsStepInput {
  customer_id: string;
  requested_amount: number;
}

export const checkSpendingLimitsStep = createStep(
  "check-spending-limits-step",
  async (data: CheckSpendingLimitsStepInput, { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE) as ICompanyModuleService;

    // Find employee by customer_id
    const employee = await companyModuleService.retrieveEmployeeByCustomerId(data.customer_id);

    if (!employee) {
      throw new Error("Employee not found for customer");
    }

    // Check spending limits
    const canSpend = await companyModuleService.checkSpendingLimit(
      employee.id,
      data.requested_amount
    );

    if (!canSpend.allowed) {
      throw new Error(`Spending limit exceeded: ${canSpend.reason}`);
    }

    return new StepResponse({
      employee_id: employee.id,
      company_id: employee.company_id,
      spending_check: canSpend,
    });
  }
);