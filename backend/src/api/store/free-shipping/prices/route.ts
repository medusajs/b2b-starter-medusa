import { listShippingOptionsForCartWorkflow } from "@medusajs/core-flows";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { RemoteQueryFunction } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { StoreFreeShippingPrice } from "../../../../types/shipping-options";
import { computeShippingOptionTargets } from "../utils";
import { StoreGetFreeShippingPricesParamsType } from "../validators";

export const GET = async (
  req: MedusaRequest<{}, StoreGetFreeShippingPricesParamsType>,
  res: MedusaResponse<{
    prices: StoreFreeShippingPrice;
  }>
) => {
  const { cart_id } = req.filterableFields;
  const listShippingOptionsWorkflow = listShippingOptionsForCartWorkflow(
    req.scope
  );
  const query = req.scope.resolve<RemoteQueryFunction>(
    ContainerRegistrationKeys.QUERY
  );

  const {
    data: [cart],
  } = await query.graph(
    {
      entity: "cart",
      fields: ["currency_code", "item_total"],
      filters: { id: cart_id },
    },
    { throwIfKeyNotFound: true }
  );

  const { result: shippingOptions } = await listShippingOptionsWorkflow.run({
    input: { cart_id, is_return: false },
  });

  // Return any valid free shipping prices that can be found for the cart
  const freeShippingPrices = shippingOptions
    .map((shippingOption) => {
      const calculatedPrice = shippingOption.calculated_price;

      if (!calculatedPrice) {
        return;
      }

      // Get all prices that are:
      // 1. Currency code is same as the cart's
      // 2. Have a rule that is set on item_total
      const validCurrencyPrices = shippingOption.prices.filter(
        (price) =>
          price.currency_code === cart.currency_code &&
          (price.price_rules || []).some(
            (priceRule) => priceRule.attribute === "item_total"
          ) &&
          price.amount === 0
      );

      return validCurrencyPrices.map((price) => {
        return {
          ...price,
          shipping_option_id: shippingOption.id,
          ...computeShippingOptionTargets(cart as any, price),
        };
      });
    })
    .flat(1)
    .filter(Boolean);

  res.json({ prices: freeShippingPrices });
};
