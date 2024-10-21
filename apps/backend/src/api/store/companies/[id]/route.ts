import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import {
  deleteCompaniesWorkflow,
  updateCompaniesWorkflow,
} from "../../../../workflows/company/workflows/";
import {
  StoreGetCompanyParamsType,
  StoreUpdateCompanyType,
} from "../validators";

export const GET = async (
  req: MedusaRequest<StoreGetCompanyParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const {
    data: [company],
  } = await query.graph(
    {
      entity: "companies",
      fields: req.remoteQueryConfig.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ company });
};

export const POST = async (
  req: MedusaRequest<StoreUpdateCompanyType>,
  res: MedusaResponse
) => {
  const { id } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  await updateCompaniesWorkflow.run({
    input: {
      id,
      ...req.body,
    },
  });

  const {
    data: [company],
  } = await query.graph(
    {
      entity: "companies",
      fields: req.remoteQueryConfig.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ company });
};

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;

  await deleteCompaniesWorkflow.run({ input: { id } });

  res.json({
    id,
    object: "employee",
    deleted: true,
  });
};
