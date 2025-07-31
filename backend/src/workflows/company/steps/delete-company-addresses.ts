import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ICompanyModuleService } from "../../../types";
import { COMPANY_MODULE } from "../../../modules/company";

export const deleteCompanyAddressStep = createStep(
  "delete-company-addresses",
  async (input: { id: string }, { container }) => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    await companyModuleService.deleteCompanyAddresses([input.id]);

    return new StepResponse({ id: input.id });
  }
);