import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { UpdateCompanyDTO } from "../../../modules/company/types/mutations";
import {
  deleteCompaniesWorkflow,
  updateCompaniesWorkflow,
} from "../../../workflows/company/workflows/";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const data = (await req.body) as UpdateCompanyDTO;

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
