import {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const ensureRole = (role: string) => {
  return async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    const { auth_identity_id } = req.auth_context;
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const {
      data: [company],
    } = await query.graph({
      entity: "companies",
      fields: ["id", "employees.id"],
      filters: { id: req.params.id },
    });

    if (company?.employees?.length === 0) {
      return next();
    }

    const {
      data: [providerIdentity],
    } = await query.graph({
      entity: "provider_identity",
      fields: ["id", "user_metadata"],
      filters: { auth_identity_id },
    });

    if (providerIdentity.user_metadata?.role === role) {
      return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  };
};
