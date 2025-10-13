export type Quote = {
  id: string;
  company_id: string;
  items: Array<{ sku?: string; variant_id?: string; quantity: number; price?: number }>;
  status: "pending" | "accepted" | "rejected";
  messages?: Array<{ author: string; text: string; at: string }>;
};

export async function createQuote(input: {
  company_id: string;
  items: Quote["items"];
  message?: string;
}): Promise<Quote> {
  // TODO: call legacy service
  return { id: "q_" + Date.now(), company_id: input.company_id, items: input.items, status: "pending" };
}

export async function listQuotes(_opts: { limit: number; offset: number }): Promise<{ quotes: Quote[]; count: number }> {
  // TODO: call legacy service
  return { quotes: [], count: 0 };
}

export async function acceptQuote(id: string): Promise<Quote> {
  // TODO: call legacy service
  return { id, company_id: "", items: [], status: "accepted" };
}

export async function rejectQuote(id: string): Promise<Quote> {
  // TODO: call legacy service
  return { id, company_id: "", items: [], status: "rejected" };
}

export async function adminUpdateQuote(id: string, patch: Partial<Quote>): Promise<Quote> {
  // TODO: call legacy service
  return { id, company_id: patch.company_id || "", items: patch.items || [], status: (patch.status as any) || "pending" };
}

