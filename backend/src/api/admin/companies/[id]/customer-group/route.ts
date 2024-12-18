import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { addCompanyToCustomerGroupWorkflow } from "../../../../../workflows/company/workflows/";
import {
  AdminAddCompanyToCustomerGroupType,
  AdminRemoveCompanyFromCustomerGroupType,
} from "../../validators";
import { removeCompanyFromCustomerGroupWorkflow } from "../../../../../workflows/company/workflows/remove-company-from-customer-group";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminAddCompanyToCustomerGroupType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;
  const { group_id } = req.body;

  await addCompanyToCustomerGroupWorkflow.run({
    input: { company_id: id, group_id },
    container: req.scope,
  });

  const {
    data: [company],
  } = await query.graph(
    {
      entity: "companies",
      fields: req.remoteQueryConfig?.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ company });
};

export const DELETE = async (
  req: AuthenticatedMedusaRequest<AdminRemoveCompanyFromCustomerGroupType>,
  res: MedusaResponse
) => {
  const { id } = req.params;
  const { group_id } = req.body;

  await removeCompanyFromCustomerGroupWorkflow.run({
    input: { company_id: id, group_id },
    container: req.scope,
  });

  res.status(201).send();
};
