import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import {
  IOrderModuleService,
  RemoteQueryFunction,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
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
      fields: req.queryConfig.fields,
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
