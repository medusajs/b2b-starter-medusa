import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { UpdateCompanyDTO } from "../../../modules/company/types/mutations";
import { COMPANY_MODULE } from "../../../modules/company";
import { CompanyDTO } from "src/modules/company/types/common";

export const updateCompaniesStep = createStep(
  "update-companies",
  async (
    input: UpdateCompanyDTO | UpdateCompanyDTO[],
    { container }
  ): Promise<StepResponse<CompanyDTO | CompanyDTO[], CompanyDTO[]>> => {
    const companyModuleService = container.resolve(COMPANY_MODULE);

    console.log("input", input);

    const ids = Array.isArray(input)
      ? input.map((company) => company.id)
      : [input.id];

    const currentData = await companyModuleService.listCompanies({
      id: ids,
    });

    const updatedCompanies = await companyModuleService.updateCompanies(input);

    return new StepResponse(updatedCompanies, currentData);
  },
  async (currentData: UpdateCompanyDTO[], { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE);
    await companyModuleService.updateCompanies(currentData);
    return new StepResponse("Company data restored", currentData);
  }
);
