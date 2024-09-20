import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { UpdateCompanyDTO } from "../../../modules/company/types/mutations";
import {
  deleteCompaniesWorkflow,
  updateCompaniesWorkflow,
} from "../../../workflows/company/workflows/";
import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
} from "@medusajs/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;

  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

  const query = remoteQueryObjectFromString({
    entryPoint: "companies",
    fields: ["*", "customers.*"],
    relations: ["customers"],
    filters: {
      id,
    },
  });

  const results = await remoteQuery(query);

  return res.status(200).json({
    company: results[0],
  });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const data = JSON.parse((await req.body) as string) as UpdateCompanyDTO;

  const { result } = await updateCompaniesWorkflow.run({
    input: {
      id,
      ...data,
    },
  });

  return res.json(result);
};

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;

  const { result } = await deleteCompaniesWorkflow.run({
    input: {
      id,
    },
  });

  return res.json({ message: result });
};
