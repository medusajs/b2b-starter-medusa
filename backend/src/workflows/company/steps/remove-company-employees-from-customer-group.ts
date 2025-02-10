import { ICustomerModuleService } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

export const removeCompanyEmployeesFromCustomerGroupStep = createStep(
  "remove-company-employees-from-customer-group",
  async (input: { company_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const {
      data: [{ employees, customer_group }],
    } = await query.graph({
      entity: "company",
      filters: { id: input.company_id },
      fields: ["id", "customer_group.*", "employees.*", "employees.customer.*"],
    });

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

    await customerModuleService.removeCustomerFromGroup(customerGroupCustomers);

    const {
      data: [{ customer_group: newCustomerGroup }],
    } = await query.graph(
      {
        entity: "company",
        filters: { id: input.company_id },
        fields: ["*", "customer_group.*"],
      },
      { throwIfKeyNotFound: true }
    );

    return new StepResponse(newCustomerGroup, {
      customer_ids: customerGroupCustomers.map(
        ({ customer_id }) => customer_id
      ),
      group_id: newCustomerGroup!.id,
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
