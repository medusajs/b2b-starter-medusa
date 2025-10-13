import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { requirePublishableKey } from "@api/utils/auth";

// GET /store/companies/:id
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  const { id } = req.params as { id: string };

  // Scaffold: retrieve from module/service later
  const company = null;
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }
  res.json({ company });
};

