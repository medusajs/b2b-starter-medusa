import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import {
  deleteCompanyCustomersWorkflow,
  updateCompanyCustomersWorkflow,
} from "../../../../../workflows/company-customer/workflows";
import {
  GetCompanyCustomerParamsType,
  UpdateCompanyCustomerType,
} from "../validators";

export const GET = async (
  req: MedusaRequest<GetCompanyCustomerParamsType>,
  res: MedusaResponse
) => {
  const { id, companyCustomerId } = req.params;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: company_customers } = await query.graph(
    {
      entity: "company_customers",
      fields: req.remoteQueryConfig.fields,
      filters: {
        ...req.filterableFields,
        id: companyCustomerId,
        company_id: id,
      },
    },
    { throwIfKeyNotFound: true }
  );

  return res.status(200).json({
    company_customer: company_customers[0],
  });
};

export const POST = async (
  req: MedusaRequest<UpdateCompanyCustomerType>,
  res: MedusaResponse
) => {
  const { id, companyCustomerId } = req.params;
  const { spending_limit, is_admin } = req.body;

  const { result } = await updateCompanyCustomersWorkflow.run({
    input: {
      id: companyCustomerId,
      company_id: id,
      spending_limit,
      is_admin,
    },
    container: req.scope,
  });

  return res.status(202).json({ company_customer: result }).send();
};

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id, companyCustomerId } = req.params;

  await deleteCompanyCustomersWorkflow.run({
    input: {
      id: companyCustomerId,
      company_id: id,
    },
    container: req.scope,
  });

  return res.status(204).send();
};
