import { ICustomerModuleService } from "@medusajs/framework/types";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ICompanyModuleService } from "@starter/types";
import { COMPANY_MODULE } from "../../../modules/company";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export const addEmployeeToCustomerGroupStep = createStep(
  "add-employee-to-customer-group",
  async (input: { employee_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const {
      data: [employee],
    } = await query.graph(
      {
        entity: "employee",
        filters: { id: input.employee_id },
        fields: ["id", "customer.*", "company.*"],
      },
      { throwIfKeyNotFound: true }
    );

    const {
      data: [company],
    } = await query.graph(
      {
        entity: "company",
        filters: { id: employee.company.id },
        fields: ["id", "customer_group.*"],
      },
      { throwIfKeyNotFound: true }
    );

    const customerModuleService = container.resolve<ICustomerModuleService>(
      Modules.CUSTOMER
    );

    await customerModuleService.addCustomerToGroup({
      customer_id: employee.customer.id,
      customer_group_id: company.customer_group.id,
    });

    const customerGroup = await customerModuleService.retrieveCustomerGroup(
      company.customer_group.id
    );

    return new StepResponse(customerGroup, {
      customer_id: employee.customer.id,
      group_id: company.customer_group.id,
    });
  },
  async (input: { customer_id: string; group_id: string }, { container }) => {
    const customerModuleService = container.resolve<ICustomerModuleService>(
      Modules.CUSTOMER
    );

    await customerModuleService.removeCustomerFromGroup({
      customer_id: input.customer_id,
      customer_group_id: input.group_id,
    });
  }
);
