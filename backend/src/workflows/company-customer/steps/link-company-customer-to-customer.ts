import { createStep, StepResponse } from "@medusajs/workflows-sdk";
import { Modules, ContainerRegistrationKeys } from "@medusajs/utils";
import { COMPANY_MODULE } from "../../../modules/company";

export const linkCompanyCustomerToCustomerStep = createStep(
  "link-company-customer-to-customer",
  async (
    input: { companyCustomerId: string; customerId: string }[],
    { container }
  ) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    const links = input.map(({ companyCustomerId, customerId }) => ({
      [COMPANY_MODULE]: {
        company_customer_id: companyCustomerId,
      },
      [Modules.CUSTOMER]: {
        customer_id: customerId,
      },
    }));

    remoteLink.create(links);

    return new StepResponse(undefined, input);
  },
  async (
    input: { companyCustomerId: string; customerId: string }[],
    { container }
  ) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    const links = input.map(({ companyCustomerId, customerId }) => ({
      [COMPANY_MODULE]: {
        company_customer_id: companyCustomerId,
      },
      [Modules.CUSTOMER]: {
        customer_id: customerId,
      },
    }));

    remoteLink.dismiss(links);
  }
);
