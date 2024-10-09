export type ModuleQuote = {
  id: string;
  status: string;
  draft_order_id: string;
  change_order_id: string;
  cart_id: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
};

export type ModuleCreateQuote = {
  draft_order_id: string;
  change_order_id: string;
  cart_id: string;
  customer_id: string;
};
