import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import {
  adminCompanyQueryConfig,
  adminEmployeeQueryConfig,
} from "./query-config";
import {
  AdminCreateCompany,
  AdminCreateEmployee,
  AdminGetCompanyParams,
  AdminGetEmployeeParams,
  AdminUpdateEmployee,
} from "./validators";

export const adminCompaniesMiddlewares: MiddlewareRoute[] = [
  /* Companies Middlewares */
  {
    method: ["GET"],
    matcher: "/admin/companies",
    middlewares: [
      validateAndTransformQuery(
        AdminGetCompanyParams,
        adminCompanyQueryConfig.list
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/companies",
    middlewares: [
      validateAndTransformBody(AdminCreateCompany),
      validateAndTransformQuery(
        AdminGetCompanyParams,
        adminCompanyQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/companies/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetCompanyParams,
        adminCompanyQueryConfig.retrieve
      ),
    ],
  },

  /* Employees Middlewares */
  {
    method: ["GET"],
    matcher: "/companies/:id/employees",
    middlewares: [
      validateAndTransformQuery(
        AdminGetEmployeeParams,
        adminEmployeeQueryConfig.list
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/companies/:id/employees",
    middlewares: [
      validateAndTransformBody(AdminCreateEmployee),
      validateAndTransformQuery(
        AdminGetEmployeeParams,
        adminEmployeeQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/companies/:id/employees/:employee_id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetEmployeeParams,
        adminEmployeeQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/companies/:id/employees/:employee_id",
    middlewares: [
      validateAndTransformBody(AdminUpdateEmployee),
      validateAndTransformQuery(
        AdminGetEmployeeParams,
        adminEmployeeQueryConfig.retrieve
      ),
    ],
  },
];
