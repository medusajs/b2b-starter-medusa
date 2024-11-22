import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import {
  IOrderModuleService,
  RemoteQueryFunction,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { StoreQuotePreviewResponse } from "@starter/types";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<StoreQuotePreviewResponse>
) => {
  const { id } = req.params;
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  );

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

  const orderModuleService: IOrderModuleService = req.scope.resolve(
    Modules.ORDER
  );

  const preview = await orderModuleService.previewOrderChange(
    quote.draft_order_id
  );

  res.status(200).json({
    quote: {
      ...quote,
      order_preview: preview,
    },
  });
};
