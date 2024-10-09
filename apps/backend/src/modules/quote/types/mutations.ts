import { QuoteDTO } from "./common";

export interface UpdateQuoteDTO extends Partial<QuoteDTO> {
  id: string;
  status: string;
}

export interface DeleteQuoteDTO {
  id: string;
}

export interface CreateQuoteMessageDTO {
  text: string;
  quote_id: string;
  admin_id?: string;
  customer_id?: string;
  item_id?: string | null;
}
