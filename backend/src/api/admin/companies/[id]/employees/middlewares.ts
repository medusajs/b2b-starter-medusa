import { MiddlewareRoute, authenticate } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/api/utils/validate-body";
import { validateAndTransformQuery } from "@medusajs/medusa/api/utils/validate-query";
import { retrieveEmployeeTransformQueryConfig } from "./query-config";
import {
  CreateEmployee,
  GetEmployeeParams,
  UpdateEmployee,
} from "./validators";

export const employeesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/companies/:id/employees",
    middlewares: [
      authenticate("user", ["session", "bearer", "api-key"]),
      validateAndTransformQuery(
        GetEmployeeParams,
        retrieveEmployeeTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/companies/:id/employees",
    middlewares: [
      authenticate("user", ["session", "bearer", "api-key"]),
      validateAndTransformBody(CreateEmployee),
      validateAndTransformQuery(
        GetEmployeeParams,
        retrieveEmployeeTransformQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/companies/:id/employees/:employee_id",
    middlewares: [
      authenticate("user", ["session", "bearer", "api-key"]),
      validateAndTransformQuery(
        GetEmployeeParams,
        retrieveEmployeeTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/companies/:id/employees/:employee_id",
    middlewares: [
      authenticate("user", ["session", "bearer", "api-key"]),
      validateAndTransformBody(UpdateEmployee),
      validateAndTransformQuery(
        GetEmployeeParams,
        retrieveEmployeeTransformQueryConfig
      ),
    ],
  },
];
