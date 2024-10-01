import { AuthenticatedMedusaRequest, Query } from "@medusajs/framework";
import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { createRequestQuoteWorkflow } from "../../../workflows/quote/workflows/create-request-quote-workflow";
import { CreateQuoteType, GetQuoteParamsType } from "./validators";

export const GET = async (
  req: MedusaRequest<GetQuoteParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: quotes } = await query.graph({
    entity: "quote",
    fields: req.remoteQueryConfig.fields,
  });

  res.json({ quotes });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateQuoteType>,
  res: MedusaResponse
) => {
  const query: Query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    result: { quote: createdQuote },
  } = await createRequestQuoteWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      customer_id: req.auth_context.actor_id,
    },
  });

  const {
    data: [quote],
  } = await query.graph(
    {
      entity: "quote",
      fields: req.remoteQueryConfig.fields,
      filters: { id: createdQuote.id },
    },
    { throwIfKeyNotFound: true }
  );

  return res.json({ quote });
};
