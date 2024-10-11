import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import {
  deleteCompaniesWorkflow,
  updateCompaniesWorkflow,
} from "../../../../workflows/company/workflows/";
import { GetCompanyParamsType, UpdateCompanyType } from "../validators";

export const GET = async (
  req: MedusaRequest<GetCompanyParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { id } = req.params;

  const { data } = await query.graph(
    {
      entity: "companies",
      fields: req.remoteQueryConfig.fields,
      filters: {
        id,
      },
    },
    { throwIfKeyNotFound: true }
  );

  return res.status(200).json({
    company: data[0],
  });
};

export const POST = async (
  req: MedusaRequest<UpdateCompanyType>,
  res: MedusaResponse
) => {
  const { id } = req.params;

  const { result } = await updateCompaniesWorkflow.run({
    input: {
      id,
      ...req.body,
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
