import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { FINANCING_MODULE } from "../../../../modules/financing";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE);

  const calculation = await financingModuleService.calculateFinancing(req.body);

  res.json({ calculation });
};