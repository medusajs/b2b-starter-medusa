import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import {
  adminApprovalSettingsQueryConfig,
  adminCompanyQueryConfig,
  adminCompanyAddressQueryConfig,
  adminEmployeeQueryConfig,
} from "./query-config";
import {
  AdminCreateCompany,
  AdminCreateCompanyAddress,
  AdminCreateEmployee,
  AdminGetApprovalSettingsParams,
  AdminGetCompanyAddressParams,
  AdminGetCompanyParams,
  AdminGetEmployeeParams,
  AdminUpdateApprovalSettings,
  AdminUpdateCompany,
  AdminUpdateCompanyAddress,
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
  {
    method: ["POST"],
    matcher: "/admin/companies/:id",
    middlewares: [
      validateAndTransformBody(AdminUpdateCompany),
      validateAndTransformQuery(
        AdminGetCompanyParams,
        adminCompanyQueryConfig.retrieve
      ),
    ],
  },

  /* Employees Middlewares */
  {
    method: ["GET"],
    matcher: "/admin/companies/:id/employees",
    middlewares: [
      validateAndTransformQuery(
        AdminGetEmployeeParams,
        adminEmployeeQueryConfig.list
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/companies/:id/employees",
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
    matcher: "/admin/companies/:id/employees/:employee_id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetEmployeeParams,
        adminEmployeeQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/companies/:id/employees/:employee_id",
    middlewares: [
      validateAndTransformBody(AdminUpdateEmployee),
      validateAndTransformQuery(
        AdminGetEmployeeParams,
        adminEmployeeQueryConfig.retrieve
      ),
    ],
  },
  /* Approval Settings Middlewares */
  {
    method: ["POST"],
    matcher: "/admin/companies/:id/approval-settings",
    middlewares: [
      validateAndTransformBody(AdminUpdateApprovalSettings),
      validateAndTransformQuery(
        AdminGetApprovalSettingsParams,
        adminApprovalSettingsQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/companies/:id/addresses",
    middlewares: [
      validateAndTransformQuery(
        AdminGetCompanyAddressParams,
        adminCompanyAddressQueryConfig.list
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/companies/:id/addresses",
    middlewares: [
      validateAndTransformBody(AdminCreateCompanyAddress),
      validateAndTransformQuery(
        AdminGetCompanyAddressParams,
        adminCompanyAddressQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["PUT"],
    matcher: "/admin/companies/:id/addresses/:address_id",
    middlewares: [
      validateAndTransformBody(AdminUpdateCompanyAddress),
      validateAndTransformQuery(
        AdminGetCompanyAddressParams,
        adminCompanyAddressQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["DELETE"],
    matcher: "/admin/companies/:id/addresses/:address_id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetCompanyAddressParams,
        adminCompanyAddressQueryConfig.retrieve
      ),
    ],
  },
];
