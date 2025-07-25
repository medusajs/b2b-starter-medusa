import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { clearDataWorkflow } from "../../../workflows/clear-data/workflows/clear-data";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    await clearDataWorkflow(req.scope).run({});

    res.json({ success: true });
  } catch (error) {
    console.error("Error executing scripts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
