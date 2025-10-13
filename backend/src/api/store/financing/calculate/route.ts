import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { FINANCING_MODULE } from "../../../../modules/financing";

export const POST = async (
  req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE);

  const calculation = await financingModuleService.calculateFinancing(req.body);

  res.json({ calculation });
};