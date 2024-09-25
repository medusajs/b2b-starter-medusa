import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/utils";
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

  if (!quote) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `order id not found: ${id}`
    );
  }

  res.json({ quote });
};
