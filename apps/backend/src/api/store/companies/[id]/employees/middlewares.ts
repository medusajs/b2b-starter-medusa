import {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute, authenticate } from "@medusajs/medusa";
import { retrieveEmployeeTransformQueryConfig } from "./query-config";
import {
  CreateEmployee,
  GetEmployeeParams,
  UpdateEmployee,
} from "./validators";
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
      data: [providerIdentity],
    } = await query.graph({
      entity: "provider_identity",
      fields: ["id", "user_metadata"],
      filters: {
        auth_identity_id,
      },
    });

    if (providerIdentity.user_metadata.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

export const storeEmployeesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/companies/:id/employees",
    middlewares: [
      authenticate("customer", ["session", "bearer", "api-key"]),
      validateAndTransformQuery(
        GetEmployeeParams,
        retrieveEmployeeTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/companies/:id/employees",
    middlewares: [
      authenticate("customer", ["session", "bearer"]),
      ensureRole("company_admin"),
      validateAndTransformBody(CreateEmployee),
      validateAndTransformQuery(
        GetEmployeeParams,
        retrieveEmployeeTransformQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/companies/:id/employees/:employee_id",
    middlewares: [
      authenticate("customer", ["session", "bearer", "api-key"]),
      validateAndTransformQuery(
        GetEmployeeParams,
        retrieveEmployeeTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/companies/:id/employees/:employee_id",
    middlewares: [
      authenticate("customer", ["session", "bearer", "api-key"]),
      ensureRole("company_admin"),
      validateAndTransformBody(UpdateEmployee),
      validateAndTransformQuery(
        GetEmployeeParams,
        retrieveEmployeeTransformQueryConfig
      ),
    ],
  },
];
