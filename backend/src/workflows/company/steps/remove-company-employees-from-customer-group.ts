import { ICustomerModuleService } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export const removeCompanyEmployeesFromCustomerGroupStep = createStep(
  "remove-company-employees-from-customer-group",
  async (input: { company_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const {
      data: [company],
    } = await query.graph(
      {
        entity: "companies",
        filters: { id: input.company_id },
        fields: ["id", "customer_group.*"],
      },
      { throwIfKeyNotFound: true }
    );

    const { data: employees } = await query.graph({
      entity: "employees",
      filters: { company_id: input.company_id },
      fields: ["id", "customer.*"],
    });

    const customerModuleService = container.resolve<ICustomerModuleService>(
      Modules.CUSTOMER
    );

    await customerModuleService.removeCustomerFromGroup(
      employees.map(({ customer }) => ({
        customer_id: customer.id,
        customer_group_id: company.customer_group.id,
      }))
    );

    const {
      data: [customerGroup],
    } = await query.graph(
      {
        entity: "customer_groups",
        filters: { id: company.customer_group.id },
        fields: ["*"],
      },
      { throwIfKeyNotFound: true }
    );

    return new StepResponse(customerGroup, {
      customer_ids: employees.map(({ customer }) => customer.id),
      group_id: company.customer_group.id,
    });
  },
  async (
    input: { customer_ids: string[]; group_id: string },
    { container }
  ) => {
    const customerModuleService = container.resolve<ICustomerModuleService>(
      Modules.CUSTOMER
    );

    await customerModuleService.addCustomerToGroup(
      input.customer_ids.map((id) => ({
        customer_id: id,
        customer_group_id: input.group_id,
      }))
    );
  }
);
