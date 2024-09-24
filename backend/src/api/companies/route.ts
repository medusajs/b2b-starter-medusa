import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { createCompaniesWorkflow } from "../../workflows/company/workflows/create-companies";
import { CreateCompanyType, GetCompanyParamsType } from "./validators";

export const GET = async (
  req: MedusaRequest<GetCompanyParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: companies, metadata } = await query.graph({
    entity: "companies",
    fields: req.remoteQueryConfig.fields,
    filters: req.filterableFields,
    pagination: {
      ...req.remoteQueryConfig.pagination,
      skip: req.remoteQueryConfig.pagination.skip ?? 0,
    },
  });

  return res.json({
    companies,
    metadata,
  });
};

export const POST = async (
  req: MedusaRequest<CreateCompanyType>,
  res: MedusaResponse
) => {
  const { result } = await createCompaniesWorkflow.run({
    input: req.body,
    container: req.scope,
  });

  return res.json({ companies: result });
};
