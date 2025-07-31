import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  deleteCompanyAddressWorkflow,
  updateCompanyAddressWorkflow,
} from "../../../../../../workflows/company/workflows";
import {
  AdminGetCompanyAddressParamsType,
  AdminUpdateCompanyAddressType,
} from "../../../validators";

export const GET = async (
  req: AuthenticatedMedusaRequest<AdminGetCompanyAddressParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { address_id } = req.params;

  const {
    data: [address],
  } = await query.graph(
    {
      entity: "company_address",
      fields: req.queryConfig.fields,
      filters: { id: address_id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ address });
};

export const PUT = async (
  req: AuthenticatedMedusaRequest<AdminUpdateCompanyAddressType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { address_id } = req.params;

  await updateCompanyAddressWorkflow.run({
    input: {
      id: address_id,
      ...req.validatedBody,
    },
    container: req.scope,
  });

  const {
    data: [address],
  } = await query.graph(
    {
      entity: "company_address",
      fields: req.queryConfig.fields,
      filters: { id: address_id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ address });
};

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { address_id } = req.params;

  await deleteCompanyAddressWorkflow.run({
    input: { id: address_id },
    container: req.scope,
  });

  res.status(200).json({
    id: address_id,
    object: "company_address",
    deleted: true,
  });
};
