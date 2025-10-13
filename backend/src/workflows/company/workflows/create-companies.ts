import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type CreateCompanyInput = {
    name: string;
    spending_limit_reset_frequency?: "never" | "daily" | "weekly" | "monthly" | "yearly";
    employees?: Array<{
        email: string;
        first_name: string;
        last_name: string;
    }>;
};

const createCompanyStep = createStep("create-company", async (input: CreateCompanyInput, { container }) => {
    const companyModuleService = container.resolve("company");

    const company = await companyModuleService.createCompanies(input);

    return new StepResponse(company, {
        companyId: company.id,
    });
});

export const createCompaniesWorkflow = createWorkflow(
    "create-companies",
    function (input: CreateCompanyInput) {
        const company = createCompanyStep(input);
        return new WorkflowResponse(company);
    }
);