import { ICustomerModuleService } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export const addCompanyEmployeesToCustomerGroupStep = createStep(
  "add-company-employees-to-customer-group",
  async (input: { company_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const {
      data: [{ id, customer_group, employees }],
    } = await query.graph(
      {
        entity: "companies",
        filters: { id: input.company_id },
        fields: [
          "*",
          "customer_group.*",
          "employees.*",
          "employees.customer.*",
        ],
      },
      { throwIfKeyNotFound: true }
    );

    const customerModuleService = container.resolve<ICustomerModuleService>(
      Modules.CUSTOMER
    );
    const customerGroupCustomers = employees
      .filter(
        (
          employee
        ): employee is typeof employee & {
          customer: { id: string };
        } =>
          Boolean(employee) &&
          Boolean(employee?.customer) &&
          Boolean(employee?.customer?.id) &&
          Boolean(customer_group?.id)
      )
      .map((employee) => ({
        customer_id: employee.customer.id,
        customer_group_id: customer_group!.id,
      }));

    await customerModuleService.addCustomerToGroup(customerGroupCustomers);

    return new StepResponse(customer_group, {
      customer_ids: customerGroupCustomers.map(
        ({ customer_id }) => customer_id
      ),
      group_id: customer_group!.id,
    });
  },
  async (
    input: { customer_ids: string[]; group_id: string },
    { container }
  ) => {
    const customerModuleService = container.resolve<ICustomerModuleService>(
      Modules.CUSTOMER
    );

    await customerModuleService.removeCustomerFromGroup(
      input.customer_ids.map((id) => ({
        customer_id: id,
        customer_group_id: input.group_id,
      }))
    );
  }
);
