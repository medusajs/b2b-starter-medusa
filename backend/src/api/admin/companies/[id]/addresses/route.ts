import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  AdminCreateCompanyAddressType,
  AdminGetCompanyAddressParamsType,
} from "../../validators";
import { createCompanyAddressWorkflow } from "../../../../../workflows/company/workflows";

export const GET = async (
  req: AuthenticatedMedusaRequest<AdminGetCompanyAddressParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id: company_id } = req.params;

  const { data: addresses } = await query.graph({
    entity: "company_address",
    fields: req.queryConfig.fields,
    filters: { company_id },
  });

  res.json({ addresses });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateCompanyAddressType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id: company_id } = req.params;

  const { result: address } = await createCompanyAddressWorkflow.run({
    input: {
      ...req.validatedBody,
      company_id,
    },
    container: req.scope,
  });

  const {
    data: [createdAddress],
  } = await query.graph(
    {
      entity: "company_address",
      fields: req.queryConfig.fields,
      filters: { id: address.id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ address: createdAddress });
};
