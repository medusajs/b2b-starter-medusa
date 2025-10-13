import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { requirePublishableKey, requireJWT } from "@api/utils/auth";

// POST /store/approvals/:id/approve
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  if (!requirePublishableKey(req, res)) return;
  if (!requireJWT(req, res)) return;
  const { id } = req.params as { id: string };
  const approval = { id, status: "approved" };
  res.json({ approval });
};

