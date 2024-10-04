import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { merchantRejectQuoteWorkflow } from "../../../../../workflows/quote/workflows/merchant-reject-quote-workflow";
import { AdminRejectQuoteType } from "../../validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminRejectQuoteType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await merchantRejectQuoteWorkflow(req.scope).run({
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
