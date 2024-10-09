import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { HttpTypes } from "@medusajs/framework/types";
import { remoteQueryObjectFromString } from "@medusajs/framework/utils";
import { addToCartWorkflow } from "@medusajs/medusa/core-flows";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { StoreAddLineItemsBulkType } from "./validators";

export async function POST(
  req: MedusaRequest<StoreAddLineItemsBulkType>,
  res: MedusaResponse<HttpTypes.StoreCartResponse>
) {
  const { id } = req.params;

  const { line_items } = req.validatedBody;

  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

  const queryObject = remoteQueryObjectFromString({
    entryPoint: "cart",
    variables: { filters: { id } },
    fields: req.remoteQueryConfig.fields,
  });

  const [cart] = await remoteQuery(queryObject);

  const workflowInput = {
    items: line_items,
    cart,
  };

  await addToCartWorkflow(req.scope).run({
    input: workflowInput,
  });

  const [updatedCart] = await remoteQuery(queryObject);

  return res.status(200).json({ cart: updatedCart });
}
