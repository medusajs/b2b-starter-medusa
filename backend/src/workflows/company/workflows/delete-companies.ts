import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";
import { ICompanyModuleService } from "../../../types/company/service";

type DeleteCompanyInput = {
    id: string;
};

const deleteCompanyStep = createStep("delete-company", async (input: DeleteCompanyInput, { container }) => {
    const companyModuleService = container.resolve(COMPANY_MODULE) as ICompanyModuleService;

    await companyModuleService.deleteCompanies([input.id]);

    return new StepResponse({ id: input.id, deleted: true });
});

export const deleteCompaniesWorkflow = createWorkflow(
    "delete-companies",
    (input: DeleteCompanyInput) => {
        const result = deleteCompanyStep(input);
        return new WorkflowResponse(result);
    }
);