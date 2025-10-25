import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { FINANCING_MODULE, FinancingModuleServiceType } from "../../../../modules/financing";

export const POST = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE) as FinancingModuleServiceType;

  const validatedBody = req.body as {
    amount: number;
    down_payment?: number;
    term_months: number;
    interest_rate_annual: number;
    system?: "PRICE" | "SAC";
    start_date?: Date;
  };

  const calculation = await financingModuleService.calculateFinancing(validatedBody);

  res.json({ calculation });
};