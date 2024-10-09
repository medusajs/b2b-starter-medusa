import { AdminCustomer, AdminOrder, StoreCart } from "@medusajs/types";
import { ModuleQuote } from "./module";

export type QueryQuote = ModuleQuote & {
  draft_order: AdminOrder;
  cart: StoreCart;
  customer: AdminCustomer;
};
