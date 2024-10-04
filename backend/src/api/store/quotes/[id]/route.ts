import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
  Query,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { GetQuoteParamsType } from "../validators";

export const GET = async (
  req: AuthenticatedMedusaRequest<GetQuoteParamsType>,
  res: MedusaResponse
) => {
  const query: Query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const {
    data: [quote],
  } = await query.graph(
    {
      entity: "quote",
      fields: req.remoteQueryConfig.fields,
      filters: {
        id,
        customer_id: req.auth_context.actor_id,
      },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ quote });
};
