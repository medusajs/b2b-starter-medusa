import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { merchantSendQuoteWorkflow } from "../../../../../workflows/quote/workflows/merchant-send-quote-workflow";
import { AdminSendQuoteType } from "../../validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminSendQuoteType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await merchantSendQuoteWorkflow(req.scope).run({
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

  res.json({ quote });
};
