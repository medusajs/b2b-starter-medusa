import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";
import { ICompanyModuleService } from "../../../types/company/service";
import { ModuleCreateCompany } from "../../../types/company/module";

const createCompanyStep = createStep("create-company", async (input: ModuleCreateCompany, { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE) as ICompanyModuleService;

    const company = await companyModuleService.createCompanies(input);

    return new StepResponse(company);
});

export const createCompaniesWorkflow = createWorkflow(
    "create-companies",
    (input: ModuleCreateCompany) => {
        const company = createCompanyStep(input);
        return new WorkflowResponse(company);
    }
);