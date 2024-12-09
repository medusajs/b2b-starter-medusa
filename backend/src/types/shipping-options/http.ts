import { StorePrice } from "@medusajs/types";

export type StoreFreeShippingPrice = StorePrice & {
  target_reached: boolean;
  target_remaining: number;
  remaining_percentage: number;
};
