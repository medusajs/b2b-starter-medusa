import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { FINANCING_MODULE } from "../../../../modules/financing";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE);
  const { id } = req.params;

  const proposal = await financingModuleService.getProposal(id);

  if (!proposal) {
    return res.status(404).json({ message: "Proposal not found" });
  }

  res.json({ proposal });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const financingModuleService = req.scope.resolve(FINANCING_MODULE);
  const { id } = req.params;
  const { action, ...data } = req.body;

  let result;

  switch (action) {
    case "approve":
      result = await financingModuleService.approveProposal({ id, ...data });
      break;
    case "contract":
      result = await financingModuleService.contractProposal({ id, ...data });
      break;
    case "cancel":
      result = await financingModuleService.cancelProposal({ id, ...data });
      break;
    default:
      result = await financingModuleService.updateProposal({ id, ...data });
  }

  res.json({ proposal: result });
};