import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
} from "@medusajs/utils";
import {
  deleteCompanyCustomersWorkflow,
  updateCompanyCustomersWorkflow,
} from "../../../../../workflows/company-customer/workflows";
import { UpdateCompanyCustomerDTO } from "src/modules/company/types/mutations";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id, companyCustomerId } = req.params;

  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

  const query = remoteQueryObjectFromString({
    entryPoint: "company_customers",
    fields: ["*", "company.*", "customer.*"],
    filters: {
      id: companyCustomerId,
      company_id: id,
    },
  });

  const { rows: company_customers } = await remoteQuery(query);

  return res.status(200).json({
    company_customer: company_customers[0],
  });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id, companyCustomerId } = req.params;
  const { spending_limit, is_admin } = req.body as UpdateCompanyCustomerDTO;

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
