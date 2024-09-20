import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
} from "@medusajs/utils";
import { CreateCompanyDTO } from "../../modules/company/types/mutations";
import { createCompaniesWorkflow } from "../../workflows/company/workflows/create-companies";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
  const filters = {} as Record<string, any>;
  let take = parseInt(req.query.take as string) || null;
  let skip = parseInt(req.query.skip as string) || 0;

  for (const key in req.query) {
    if (["take", "skip"].includes(key)) continue;

    filters[key] = req.query[key];
  }

  const companiesQuery = remoteQueryObjectFromString({
    entryPoint: "companies",
    fields: ["*", "customers.*"],
    relations: ["customers"],
    variables: {
      filters,
      skip,
      take,
    },
  });

  const { rows: companies, metadata } = await remoteQuery(companiesQuery);

  return res.json({
    companies,
    metadata,
  });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const data: CreateCompanyDTO = JSON.parse((await req.body) as string);

  const { result } = await createCompaniesWorkflow.run({
    input: data,
    container: req.scope,
  });

  return res.json({ companies: result });
};
