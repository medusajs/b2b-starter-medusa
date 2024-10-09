import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AdminQuoteResponse } from "@starter/types";
import { customerAcceptQuoteWorkflow } from "../../../../../workflows/quote/workflows";
import { AcceptQuoteType } from "../../validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<AcceptQuoteType>,
  res: MedusaResponse<AdminQuoteResponse>
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  await customerAcceptQuoteWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      quote_id: id,
      customer_id: req.auth_context.actor_id,
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
