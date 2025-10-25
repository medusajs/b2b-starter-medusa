import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { FINANCING_MODULE, FinancingModuleServiceType } from "../../../../../modules/financing";

export const GET = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE) as FinancingModuleServiceType;
  const { company_id } = req.params;

  const proposals = await financingModuleService.getCompanyFinancingHistory(company_id);

  res.json({ proposals });
};