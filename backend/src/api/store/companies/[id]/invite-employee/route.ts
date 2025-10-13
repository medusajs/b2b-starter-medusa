import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { inviteEmployeesWorkflow } from "../../../../../workflows/employee/workflows";
import { StoreInviteEmployeeType } from "../../validators";

export const POST = async (
    req: MedusaRequest<StoreInviteEmployeeType>,
    res: MedusaResponse
) => {
    const { id } = req.params;
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const { result: invitedEmployee } = await inviteEmployeesWorkflow.run({
        input: {
            ...req.validatedBody,
            company_id: id,
        },
        container: req.scope,
    });

    // For now, return the mock employee data
    // TODO: Return proper employee data from database
    const employee = {
        id: invitedEmployee.id,
        customer_id: invitedEmployee.customer_id,
        spending_limit: invitedEmployee.spending_limit,
        is_admin: invitedEmployee.is_admin,
        company_id: invitedEmployee.company_id,
        created_at: invitedEmployee.created_at,
        updated_at: invitedEmployee.updated_at,
        customer: {
            id: invitedEmployee.customer_id,
            email: invitedEmployee.email,
            first_name: invitedEmployee.first_name,
            last_name: invitedEmployee.last_name,
            created_at: invitedEmployee.created_at,
            updated_at: invitedEmployee.updated_at,
        },
    };

    res.json({ employee });
};