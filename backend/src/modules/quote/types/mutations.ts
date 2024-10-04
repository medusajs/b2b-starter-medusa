import { QuoteDTO } from "./common";

export interface CreateQuoteDTO
  extends Omit<Partial<QuoteDTO>, "id" | "createdAt" | "updatedAt"> {
  cart_id: string;
  customer_id: string;
  draft_order_id: string;
  order_change_id: string;
}

export interface UpdateQuoteDTO extends Partial<QuoteDTO> {
  id: string;
  status: string;
}

export interface DeleteQuoteDTO {
  id: string;
}

export interface CreateQuoteCommentDTO {
  text: string;
  quote_id: string;
  admin_id?: string;
  customer_id?: string;
  item_id?: string;
}
