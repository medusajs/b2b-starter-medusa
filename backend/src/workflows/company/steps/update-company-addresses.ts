import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ICompanyModuleService, ModuleUpdateCompanyAddress } from "../../../types";
import { COMPANY_MODULE } from "../../../modules/company";

export const updateCompanyAddressStep = createStep(
  "update-company-addresses",
  async (input: ModuleUpdateCompanyAddress, { container }) => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    const address = await companyModuleService.updateCompanyAddresses(input);

    return new StepResponse(address);
  }
);