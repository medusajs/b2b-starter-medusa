import { createWorkflow, WorkflowResponse } from '@medusajs/workflows-sdk';

type InviteEmployeeInput = {
    first_name: string;
    last_name: string;
    email: string;
    spending_limit?: number;
    is_admin?: boolean;
    company_id: string;
};

type InviteEmployeeResult = {
    id: string;
    customer_id: string;
    spending_limit: number;
    is_admin: boolean;
    company_id: string;
    created_at: Date;
    updated_at: Date;
    first_name: string;
    last_name: string;
    email: string;
};

export const inviteEmployeesWorkflow = createWorkflow(
    'invite-employees',
    function (input: InviteEmployeeInput): WorkflowResponse<InviteEmployeeResult> {
        // Placeholder implementation
        // TODO: Implement full customer creation + employee creation
        const mockEmployee: InviteEmployeeResult = {
            id: `emp_${Date.now()}`,
            customer_id: `cus_${Date.now()}`,
            spending_limit: input.spending_limit || 0,
            is_admin: input.is_admin || false,
            company_id: input.company_id,
            created_at: new Date(),
            updated_at: new Date(),
            first_name: input.first_name,
            last_name: input.last_name,
            email: input.email,
        };

        return new WorkflowResponse(mockEmployee);
    }
);
