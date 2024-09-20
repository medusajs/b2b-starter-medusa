import { createCustomersWorkflow } from "@medusajs/core-flows";
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { CreateCustomerDTO } from "@medusajs/types";
import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
} from "@medusajs/utils";
import { CreateCompanyCustomerDTO } from "../../../../modules/company/types/mutations";
import { createCompanyCustomersWorkflow } from "../../../../workflows/company-customer/workflows";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const filters = {
    company_id: id,
  } as Record<string, any>;
  let take = parseInt(req.query.take as string) || null;
  let skip = parseInt(req.query.skip as string) || 0;

  for (const key in req.query) {
    if (["take", "skip"].includes(key)) continue;

    filters[key] = req.query[key];
  }

  const companyCustomersQuery = remoteQueryObjectFromString({
    entryPoint: "company_customers",
    fields: ["*", "company.*", "customer.*"],
    variables: {
      filters,
      skip,
      take,
    },
    relations: ["company", "customer"],
    filters,
  });

  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

  const { rows: companyCustomers, metadata } = await remoteQuery(
    companyCustomersQuery
  );

  return res.json({
    companyCustomers,
    metadata,
  });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;

  let { customer_id, is_admin, spending_limit, ...customerData } =
    req.body as CreateCompanyCustomerDTO & {
      customer_id?: string | CreateCustomerDTO;
    };

  if (!customer_id) {
    const { result: customers } = await createCustomersWorkflow.run({
      input: {
        customersData: [customerData],
      },
      container: req.scope,
    });

    customer_id = customers[0].id;
  }

  const { result } = await createCompanyCustomersWorkflow.run({
    input: [
      {
        companyCustomerData: {
          company_id: id,
          customer_id,
          is_admin,
          spending_limit,
        },
        customerId: customer_id,
      },
    ],
    container: req.scope,
  });

  return res.json({ company_customers: result });
};
