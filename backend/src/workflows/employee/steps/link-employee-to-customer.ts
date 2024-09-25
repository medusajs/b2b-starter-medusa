import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { Modules, ContainerRegistrationKeys } from "@medusajs/utils";
import { COMPANY_MODULE } from "../../../modules/company";

export const linkEmployeeToCustomerStep = createStep(
  "link-employee-to-customer",
  async (
    input: { employeeId: string; customerId: string }[],
    { container }
  ) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    const links = input.map(({ employeeId, customerId }) => ({
      [COMPANY_MODULE]: {
        employee_id: employeeId,
      },
      [Modules.CUSTOMER]: {
        customer_id: customerId,
      },
    }));

    remoteLink.create(links);

    return new StepResponse(undefined, input);
  },
  async (
    input: { employeeId: string; customerId: string }[],
    { container }
  ) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    const links = input.map(({ employeeId, customerId }) => ({
      [COMPANY_MODULE]: {
        employee_id: employeeId,
      },
      [Modules.CUSTOMER]: {
        customer_id: customerId,
      },
    }));

    remoteLink.dismiss(links);
  }
);
