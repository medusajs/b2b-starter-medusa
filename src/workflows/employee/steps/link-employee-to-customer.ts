import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";

export const linkEmployeeToCustomerStep = createStep(
  "link-employee-to-customer",
  async (
    input: { employeeId: string; customerId: string },
    { container }
  ): Promise<
    StepResponse<undefined, { employeeId: string; customerId: string }>
  > => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    const link = {
      [COMPANY_MODULE]: {
        employee_id: input.employeeId,
      },
      [Modules.CUSTOMER]: {
        customer_id: input.customerId,
      },
    };

    await remoteLink.create(link);

    return new StepResponse(undefined, input);
  },
  async (
    input: { employeeId: string; customerId: string },
    { container }
  ): Promise<
    StepResponse<undefined, { employeeId: string; customerId: string }>
  > => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    const link = {
      [COMPANY_MODULE]: {
        employee_id: input.employeeId,
      },
      [Modules.CUSTOMER]: {
        customer_id: input.customerId,
      },
    };

    await remoteLink.dismiss(link);

    return new StepResponse(undefined, input);
  }
);
