import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createQuoteMessageWorkflow } from "../../../../../workflows/quote/workflows";
import { AdminCreateQuoteMessageType } from "../../validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateQuoteMessageType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await createQuoteMessageWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      admin_id: req.auth_context.actor_id,
      quote_id: id,
    },
  });

  const {
    data: [quote],
  } = await query.graph(
    {
      entity: "quote",
      fields: req.queryConfig.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ quote });
};
