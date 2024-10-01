import { MiddlewareRoute } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/api/utils/validate-body";
import { validateAndTransformQuery } from "@medusajs/medusa/api/utils/validate-query";

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
