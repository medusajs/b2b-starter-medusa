import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute, authenticate } from "@medusajs/medusa";

import { retrieveCompanyTransformQueryConfig } from "./query-config";
import { CreateCompany, GetCompanyParams } from "./validators";

export const storeCompaniesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/companies",
    middlewares: [
      authenticate("customer", ["session", "bearer", "api-key"]),
      validateAndTransformQuery(
        GetCompanyParams,
        retrieveCompanyTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/companies",
    middlewares: [
      validateAndTransformBody(CreateCompany),
      validateAndTransformQuery(
        GetCompanyParams,
        retrieveCompanyTransformQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/companies/:id",
    middlewares: [
      authenticate("customer", ["session", "bearer", "api-key"]),
      validateAndTransformQuery(
        GetCompanyParams,
        retrieveCompanyTransformQueryConfig
      ),
    ],
  },
];
