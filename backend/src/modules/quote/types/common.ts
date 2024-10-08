import {
  AdminOrder,
  AdminOrderChange,
  CartDTO,
} from "@medusajs/framework/types";

export interface QuoteDTO {
  id: string;
  status: string;
  draft_order_id: string;
  draft_order: AdminOrder;
  cart_id: string;
  cart: CartDTO;
  order_change_id: string;
  order_change: AdminOrderChange;
}

export interface QuoteMessageDTO {
  id: string;
  text: string;
  quote_id: string;
  admin_id: string;
  customer_id: string;
  item_id: string;
}
