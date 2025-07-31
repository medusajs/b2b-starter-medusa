import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  StoreGetCompanyAddressParamsType,
  StoreUpdateCompanyAddressType,
} from "../../validators";
import {
  updateCompanyAddressWorkflow,
  deleteCompanyAddressWorkflow,
} from "../../../../../workflows/company/workflows";

const getEmployeeFromAuth = async (req: AuthenticatedMedusaRequest) => {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

  const [{ employee }] = await remoteQuery(
    {
      entryPoint: "customer",
      fields: ["employee.company.id"],
      variables: {
        filters: { id: req.auth_context?.actor_id },
      },
    },
    { throwIfKeyNotFound: true }
  );

  return employee;
};

export const GET = async (
  req: AuthenticatedMedusaRequest<StoreGetCompanyAddressParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { address_id } = req.params;

  const employee = await getEmployeeFromAuth(req);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const {
    data: [address],
  } = await query.graph(
    {
      entity: "company_address",
      fields: req.queryConfig.fields,
      filters: { id: address_id, company_id: employee.company_id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ address });
};

export const PUT = async (
  req: AuthenticatedMedusaRequest<StoreUpdateCompanyAddressType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { address_id } = req.params;

  const employee = await getEmployeeFromAuth(req);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  if (!employee.is_admin) {
    return res.status(403).json({ message: "Only company admins can update addresses" });
  }

  const {
    data: [existingAddress],
  } = await query.graph({
    entity: "company_address",
    fields: ["id", "company_id"],
    filters: { id: address_id, company_id: employee.company_id },
  });

  if (!existingAddress) {
    return res.status(404).json({ message: "Address not found" });
  }

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
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { address_id } = req.params;

  const employee = await getEmployeeFromAuth(req);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  if (!employee.is_admin) {
    return res
      .status(403)
      .json({ message: "Only company admins can delete addresses" });
  }

  // Verify the address belongs to the employee's company
  const {
    data: [existingAddress],
  } = await query.graph({
    entity: "company_address",
    fields: ["id", "company_id"],
    filters: { id: address_id, company_id: employee.company_id },
  });

  if (!existingAddress) {
    return res.status(404).json({ message: "Address not found" });
  }

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
