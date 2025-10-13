import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";
import { ICompanyModuleService } from "../../../types/company/service";
import { ModuleUpdateCompany } from "../../../types/company/module";

const updateCompanyStep = createStep("update-company", async (input: ModuleUpdateCompany, { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE) as ICompanyModuleService;

    const company = await companyModuleService.updateCompanies(input);

    return new StepResponse(company);
}); export const updateCompaniesWorkflow = createWorkflow(
    "update-companies",
    (input: ModuleUpdateCompany) => {
        const company = updateCompanyStep(input);
        return new WorkflowResponse(company);
    }
);