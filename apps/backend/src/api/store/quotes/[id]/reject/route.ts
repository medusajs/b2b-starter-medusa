import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { RemoteQueryFunction } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AdminQuoteResponse } from "@starter/types";
import { customerRejectQuoteWorkflow } from "../../../../../workflows/quote/workflows";
import { RejectQuoteType } from "../../validators";

export const POST = async (
  req: MedusaRequest<RejectQuoteType>,
  res: MedusaResponse<AdminQuoteResponse>
) => {
  const { id } = req.params;
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  );

  await customerRejectQuoteWorkflow(req.scope).run({
    input: {
      quote_id: id,
      ...req.validatedBody,
    },
  });

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

  return res.json({ quote });
};
