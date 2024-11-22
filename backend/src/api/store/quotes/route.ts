import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { RemoteQueryFunction } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AdminQuoteResponse, AdminQuotesResponse } from "@starter/types";
import { createRequestForQuoteWorkflow } from "../../../workflows/quote/workflows/create-request-for-quote";
import { CreateQuoteType, GetQuoteParamsType } from "./validators";

export const GET = async (
  req: AuthenticatedMedusaRequest<GetQuoteParamsType>,
  res: MedusaResponse<AdminQuotesResponse>
) => {
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  );

  const { fields, pagination } = req.remoteQueryConfig;
  const { data: quotes, metadata } = await query.graph({
    entity: "quote",
    fields,
    filters: {
      customer_id: req.auth_context.actor_id,
    },
    pagination: {
      ...pagination,
      skip: pagination.skip!,
    },
  });

  res.json({
    quotes,
    count: metadata!.count,
    offset: metadata!.skip,
    limit: metadata!.take,
  });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<CreateQuoteType>,
  res: MedusaResponse<AdminQuoteResponse>
) => {
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  );

  const {
    result: { quote: createdQuote },
  } = await createRequestForQuoteWorkflow(req.scope).run({
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
