import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { customerRejectQuoteWorkflow } from "../../../../../workflows/quote/workflows/customer-reject-quote-workflow";
import { RejectQuoteType } from "../../validators";

export const POST = async (
  req: MedusaRequest<RejectQuoteType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

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
