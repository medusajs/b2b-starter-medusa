import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/medusa";
import { createCompaniesWorkflow } from "../../../workflows/company/workflows/create-companies";
import { CreateCompanyType, GetCompanyParamsType } from "./validators";

export const GET = async (
  req: AuthenticatedMedusaRequest<GetCompanyParamsType>,
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
  req: AuthenticatedMedusaRequest<CreateCompanyType>,
  res: MedusaResponse
) => {
  const { result } = await createCompaniesWorkflow.run({
    input: {
      ...req.validatedBody,
    },
    container: req.scope,
  });

  return res.json({ companies: result });
};
