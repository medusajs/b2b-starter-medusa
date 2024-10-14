import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import {
  ICompanyModuleService,
  ModuleCreateCompany,
  QueryCompany,
} from "@starter/types";
import { COMPANY_MODULE } from "../../../modules/company";

export const createCompaniesStep = createStep(
  "create-companies",
  async (
    input: ModuleCreateCompany,
    { container }
  ): Promise<StepResponse<QueryCompany, string>> => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);
    const createdCompany = await companyModuleService.createCompanies(input);

    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const {
      data: [company],
    } = await query.graph({
      entity: "companies",
      filters: {
        id: createdCompany.id,
      },
      fields: ["*", "+employees"],
    });

    return new StepResponse(company, company.id);
  },
  async (companyId: string, { container }) => {
    const companyModuleService =
      container.resolve<ICompanyModuleService>(COMPANY_MODULE);
    await companyModuleService.deleteCompanies([companyId]);

    return new StepResponse("Company deleted", companyId);
  }
);
