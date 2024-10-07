import {
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

export const adminEmployeesMiddlewares: MiddlewareRoute[] = [
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
