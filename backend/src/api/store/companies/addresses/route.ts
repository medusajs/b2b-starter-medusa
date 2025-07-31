import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  StoreCreateCompanyAddressType,
  StoreGetCompanyAddressParamsType,
} from "../validators";
import { createCompanyAddressWorkflow } from "../../../../workflows/company/workflows";

export const GET = async (
  req: AuthenticatedMedusaRequest<StoreGetCompanyAddressParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

  const [{ employee }] = await remoteQuery({
    entryPoint: "customer",
    fields: ["employee.company.id"],
    variables: {
      filters: { id: req.auth_context?.actor_id },
    },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const { data: addresses } = await query.graph({
    entity: "company_address",
    fields: req.queryConfig.fields,
    filters: { company_id: employee.company_id },
  });

  res.json({ addresses });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<StoreCreateCompanyAddressType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

  const [{ employee }] = await remoteQuery({
    entryPoint: "customer",
    fields: ["employee.company.id", "employee.is_admin"],
    variables: {
      filters: { id: req.auth_context?.actor_id },
    },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  if (!employee.is_admin) {
    return res.status(403).json({ message: "Only company admins can create addresses" });
  }

  const { result: address } = await createCompanyAddressWorkflow.run({
    input: {
      ...req.validatedBody,
      company_id: employee.company_id,
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
