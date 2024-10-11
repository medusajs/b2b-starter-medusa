import {
  AdminOrderPreview,
  FindParams,
  PaginatedResponse,
} from "@medusajs/types";
import { QueryQuote } from "./query";
import { ModuleQuoteFilters } from "./service";

/* Filters */

export interface QuoteFilterParams extends FindParams, ModuleQuoteFilters {}

/* Admin */
export type AdminQuoteResponse = {
  quote: QueryQuote;
};

export type AdminQuotesResponse = PaginatedResponse<{
  quotes: QueryQuote[];
}>;

export type AdminCreateQuoteMessage = {
  text: string;
  item_id?: string;
};

/* Store */

export type StoreQuoteResponse = {
  quote: QueryQuote;
};

export type StoreQuotesResponse = PaginatedResponse<{
  quotes: QueryQuote[];
}>;

export type StoreQuotePreviewResponse = {
  quote: QueryQuote & {
    order_preview: AdminOrderPreview;
  };
};

export type StoreCreateQuote = {
  cart_id: string;
};

export type StoreCreateQuoteMessage = {
  text: string;
  item_id?: string;
};
