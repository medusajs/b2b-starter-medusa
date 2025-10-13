import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../company";
import { ICompanyModuleService } from "../../../../types/company/service";

export interface LinkCustomerGroupStepInput {
  customer_id: string;
  financing_proposal_id: string;
}

export const linkCustomerGroupStep = createStep(
  "link-customer-group-step",
  async (data: LinkCustomerGroupStepInput, { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE) as ICompanyModuleService;

    // Find employee by customer_id
    const employee = await companyModuleService.retrieveEmployeeByCustomerId(data.customer_id);

    if (!employee?.company_id) {
      return new StepResponse(null);
    }

    // Get company with customer_group_id
    const company = await companyModuleService.retrieveCompany(employee.company_id);

    if (!company?.customer_group_id) {
      return new StepResponse(null);
    }

    return new StepResponse({
      customer_group_id: company.customer_group_id,
      company_id: company.id,
    });
  }
);