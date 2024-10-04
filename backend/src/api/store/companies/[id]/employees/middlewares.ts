import { MiddlewareRoute, authenticate } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/api/utils/validate-body";
import { validateAndTransformQuery } from "@medusajs/medusa/api/utils/validate-query";
import { retrieveEmployeeTransformQueryConfig } from "./query-config";
import {
  GetEmployeeParams,
  CreateEmployee,
  UpdateEmployee,
} from "./validators";

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
      validateAndTransformBody(UpdateEmployee),
      validateAndTransformQuery(
        GetEmployeeParams,
        retrieveEmployeeTransformQueryConfig
      ),
    ],
  },
];
