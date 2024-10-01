import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { AdminGetQuoteParamsType } from "./validators";

export const GET = async (
  req: MedusaRequest<AdminGetQuoteParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: quotes } = await query.graph({
    entity: "quote",
    fields: req.remoteQueryConfig.fields,
  });

  res.json({ quotes });
};
