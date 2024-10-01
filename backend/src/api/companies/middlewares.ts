import { MiddlewareRoute } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/api/utils/validate-body";
import { validateAndTransformQuery } from "@medusajs/medusa/api/utils/validate-query";

import { retrieveCompanyTransformQueryConfig } from "./query-config";
import { CreateCompany, GetCompanyParams } from "./validators";

export const companiesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/companies",
    middlewares: [
      validateAndTransformQuery(
        GetCompanyParams,
        retrieveCompanyTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/companies",
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
    matcher: "/companies/:id",
    middlewares: [
      validateAndTransformQuery(
        GetCompanyParams,
        retrieveCompanyTransformQueryConfig
      ),
    ],
  },
];
