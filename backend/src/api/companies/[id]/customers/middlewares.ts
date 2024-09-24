import { MiddlewareRoute } from "@medusajs/medusa";
import { validateAndTransformBody } from "@medusajs/medusa/dist/api/utils/validate-body";
import { validateAndTransformQuery } from "@medusajs/medusa/dist/api/utils/validate-query";
import { retrieveCompanyCustomerTransformQueryConfig } from "./query-config";
import {
  GetCompanyCustomerParams,
  CreateCompanyCustomer,
  UpdateCompanyCustomer,
} from "./validators";

export const companyCustomersMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/companies/:id/customers",
    middlewares: [
      validateAndTransformQuery(
        GetCompanyCustomerParams,
        retrieveCompanyCustomerTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/companies/:id/customers",
    middlewares: [
      validateAndTransformBody(CreateCompanyCustomer),
      validateAndTransformQuery(
        GetCompanyCustomerParams,
        retrieveCompanyCustomerTransformQueryConfig
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/companies/:id/customers/:customer_id",
    middlewares: [
      validateAndTransformQuery(
        GetCompanyCustomerParams,
        retrieveCompanyCustomerTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/companies/:id/customers/:customer_id",
    middlewares: [
      validateAndTransformBody(UpdateCompanyCustomer),
      validateAndTransformQuery(
        GetCompanyCustomerParams,
        retrieveCompanyCustomerTransformQueryConfig
      ),
    ],
  },
];
