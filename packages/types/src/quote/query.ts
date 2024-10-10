import {
  AdminCustomer,
  AdminOrder,
  AdminUser,
  StoreCart,
} from "@medusajs/types";
import { ModuleQuote, ModuleQuoteMessage } from "./module";

export type QueryQuote = ModuleQuote & {
  draft_order: AdminOrder;
  cart: StoreCart;
  customer: AdminCustomer;
  messages: QueryQuoteMessage[];
};

export type QueryQuoteMessage = ModuleQuoteMessage & {
  customer: AdminCustomer;
  admin: AdminUser;
};
