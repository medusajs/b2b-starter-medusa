import { AdminOrder, AdminOrderChange, CartDTO } from "@medusajs/types";

export interface QuoteDTO {
  id: string;
  draft_order_id: string;
  draft_order: AdminOrder;
  cart_id: string;
  cart: CartDTO;
  order_change_id: string;
  order_change: AdminOrderChange;
}
