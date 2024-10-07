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
