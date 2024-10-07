import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute, authenticate } from "@medusajs/medusa";

import { retrieveCompanyTransformQueryConfig } from "./query-config";
import { CreateCompany, GetCompanyParams } from "./validators";

export const adminCompaniesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/companies",
    middlewares: [
      authenticate("user", ["session", "bearer", "api-key"]),
      validateAndTransformQuery(
        GetCompanyParams,
        retrieveCompanyTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/companies",
    middlewares: [
      authenticate("user", ["session", "bearer", "api-key"]),
      validateAndTransformBody(CreateCompany),
      validateAndTransformQuery(
        GetCompanyParams,
        retrieveCompanyTransformQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/companies/:id",
    middlewares: [
      authenticate("user", ["session", "bearer", "api-key"]),
      validateAndTransformQuery(
        GetCompanyParams,
        retrieveCompanyTransformQueryConfig
      ),
    ],
  },
];
