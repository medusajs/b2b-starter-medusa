import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { GetQuoteParamsType } from "../validators";

export const GET = async (
  req: MedusaRequest<GetQuoteParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const {
    data: [quote],
  } = await query.graph(
    {
      entity: "quote",
      fields: req.remoteQueryConfig.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ quote });
};
