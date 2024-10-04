import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { createQuoteCommentWorkflow } from "../../../../../workflows/quote/workflows/create-quote-comment-workflow";
import { StoreCreateQuoteCommentType } from "../../validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<StoreCreateQuoteCommentType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await createQuoteCommentWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      customer_id: req.auth_context.actor_id,
      quote_id: id,
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
