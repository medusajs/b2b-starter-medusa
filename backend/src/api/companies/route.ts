import { CreateCompanyDTO } from "../../modules/company/types/mutations";
import { createCompaniesWorkflow } from "../../workflows/company/workflows/create-companies";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { remoteQueryObjectFromString } from "@medusajs/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const remoteQuery = req.scope.resolve("remoteQuery");
  const filters = {} as Record<string, any>;
  let take = parseInt(req.query.take as string) || null;
  let skip = parseInt(req.query.skip as string) || 0;

  for (const key in req.query) {
    if (["take", "skip"].includes(key)) continue;

    filters[key] = req.query[key];
  }

  const companiesQuery = remoteQueryObjectFromString({
    entryPoint: "companies",
    fields: ["*"],
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
  const { name, phone, email, address, city, state, zip, country, logo_url } =
    (await req.body) as CreateCompanyDTO;

  const { result } = await createCompaniesWorkflow.run({
    input: {
      name,
      phone,
      email,
      address,
      city,
      state,
      zip,
      country,
      logo_url,
    },
  });

  console.log({ result });

  return { companies: result };
};
