import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createCompaniesWorkflow } from "../../../workflows/company/workflows/create-companies";
import { AdminCreateCompanyType } from "./validators";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: companies, metadata } = await query.graph({
    entity: "companies",
    fields: req.remoteQueryConfig.fields,
    filters: req.filterableFields,
    pagination: {
      ...req.remoteQueryConfig.pagination
    },
  });

  res.json({
    companies,
    count: metadata!.count,
    offset: metadata!.skip,
    limit: metadata!.take,
  });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateCompanyType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { result: createdCompany } = await createCompaniesWorkflow.run({
    input: { ...req.validatedBody },
    container: req.scope,
  });

  const {
    data: [company],
  } = await query.graph(
    {
      entity: "companies",
      fields: req.remoteQueryConfig.fields,
      filters: { id: createdCompany.id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ company });
};
