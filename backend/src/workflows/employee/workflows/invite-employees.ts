import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/workflows-sdk";
import { ModuleEmployee } from "../../../types";

type InviteEmployeeInput = {
    first_name: string;
    last_name: string;
    email: string;
    spending_limit?: number;
    is_admin?: boolean;
    company_id: string;
};

export const inviteEmployeesWorkflow = createWorkflow(
    "invite-employees",
    function (input: InviteEmployeeInput): WorkflowResponse<ModuleEmployee> {
        // For now, create a placeholder employee
        // TODO: Implement full customer creation + employee creation
        const employee = createInviteEmployeeStep(input);

        return new WorkflowResponse(employee);
    }
);

const createInviteEmployeeStep = createStep(
    "create-invite-employee",
    async (input: InviteEmployeeInput) => {
        // Placeholder implementation
        // This should create a customer and then an employee
        // For now, return a mock employee object
        const mockEmployee = {
            id: `emp_${Date.now()}`,
            customer_id: `cus_${Date.now()}`,
            spending_limit: input.spending_limit || 0,
            is_admin: input.is_admin || false,
            company_id: input.company_id,
            created_at: new Date(),
            updated_at: new Date(),
            customer: {
                id: `cus_${Date.now()}`,
                email: input.email,
                first_name: input.first_name,
                last_name: input.last_name,
                created_at: new Date(),
                updated_at: new Date(),
            },
            company: {
                id: input.company_id,
                name: "Mock Company",
                created_at: new Date(),
                updated_at: new Date(),
            },
        };

        return new StepResponse(mockEmployee);
    }
);