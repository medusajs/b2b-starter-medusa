import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { resetDemoDataWorkflow } from "../../../workflows/reset-demo-data";

const isDemoResetEnabled = process.env.VITE_ENABLE_DEMO_RESET === "true";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!isDemoResetEnabled) {
    return res.status(403).json({
      success: false,
      error: "Demo reset is not enabled in this environment",
    });
  }

  try {
    await resetDemoDataWorkflow(req.scope).run({});

    res.json({ success: true });
  } catch (error) {
    console.error("Error executing scripts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
