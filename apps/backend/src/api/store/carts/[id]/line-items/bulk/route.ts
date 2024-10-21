import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { HttpTypes } from "@medusajs/framework/types";
import { addToCartWorkflow } from "@medusajs/medusa/core-flows";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { StoreAddLineItemsBulkType } from "../../../validators";

export async function POST(
  req: MedusaRequest<StoreAddLineItemsBulkType>,
  res: MedusaResponse<HttpTypes.StoreCartResponse>
) {
  const { id } = req.params;
  const { line_items } = req.validatedBody;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [cart],
  } = await query.graph(
    {
      entity: "cart",
      fields: req.remoteQueryConfig.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  const workflowInput = {
    items: line_items,
    cart,
  };

  await addToCartWorkflow(req.scope).run({
    input: workflowInput,
  });

  const {
    data: [upatedCart],
  } = await query.graph(
    {
      entity: "cart",
      fields: req.remoteQueryConfig.fields,
      filters: { id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ cart: upatedCart });
}
