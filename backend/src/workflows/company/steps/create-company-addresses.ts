import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ICompanyModuleService, ModuleCreateCompanyAddress } from "../../../types";
import { COMPANY_MODULE } from "../../../modules/company";

export const createCompanyAddressStep = createStep(
  "create-company-addresses",
  async (input: ModuleCreateCompanyAddress, { container }) => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    const address = await companyModuleService.createCompanyAddresses(input);

    return new StepResponse(address, address.id);
  },
  async (addressId: string, { container }) => {
    if (!addressId) {
      return;
    }

    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);

    await companyModuleService.deleteCompanyAddresses([addressId]);
  }
);