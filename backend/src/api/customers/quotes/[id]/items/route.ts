import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { ContainerRegistrationKeys } from "@medusajs/utils";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [quote],
  } = await query.graph(
    {
      entity: "quote",
      fields: req.remoteQueryConfig.fields,
      filters: { id: req.params.id },
    },
    { throwIfKeyNotFound: true }
  );

  return res.json({ quote });
};
