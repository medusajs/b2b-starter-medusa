import { IAuthModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const setAdminRoleStep = createStep(
  "set-admin-role",
  async (input: { employeeId: string }, { container }): Promise<any> => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const {
      data: [employee],
    } = await query.graph(
      {
        entity: "employee",
        fields: ["id", "customer", "customer.email"],
        filters: {
          id: input.employeeId,
        },
      },
      { throwIfKeyNotFound: true }
    );

    if (employee.is_admin === true) {
      return new StepResponse(undefined, input);
    }

    const {
      data: [providerIdentity],
    } = await query.graph({
      entity: "provider_identity",
      fields: ["id"],
      filters: {
        provider: "emailpass",
        entity_id: employee.customer.email,
      },
    });

    const authModuleService = container.resolve<IAuthModuleService>(
      Modules.AUTH
    );

    await authModuleService.updateProviderIdentities([
      {
        id: providerIdentity.id,
        user_metadata: {
          role: "company_admin",
        },
      },
    ]);

    return new StepResponse(undefined, input);
  },
  async (input: { providerIdentityId: string }, { container }) => {
    const authModuleService = container.resolve<IAuthModuleService>(
      Modules.AUTH
    );

    await authModuleService.updateProviderIdentities([
      {
        id: input.providerIdentityId,
        user_metadata: {
          role: null,
        },
      },
    ]);
    return new StepResponse(undefined, input);
  }
);
