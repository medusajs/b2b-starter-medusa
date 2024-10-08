import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import {
  HttpTypes,
  IOrderModuleService,
  RemoteQueryFunction,
} from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminOrderPreviewResponse>
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
      fields: ["draft_order_id"],
      filters: {
        id,
        customer_id: req.auth_context.actor_id,
      },
    },
    { throwIfKeyNotFound: true }
  );

  const orderModuleService: IOrderModuleService = req.scope.resolve(
    Modules.ORDER
  );

  const preview = await orderModuleService.previewOrderChange(
    quote.draft_order_id
  );

  res.status(200).json({ preview });
};
