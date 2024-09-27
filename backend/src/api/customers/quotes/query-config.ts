export const quoteFields = [
  "id",
  "cart.id",
  "draft_order.id",
  "draft_order.*",
  "draft_order.summary.*",
  "draft_order.items.*",
  "draft_order.payment_collections.*",
  "order_change.*",
  "order_change.actions.*",
];

export const retrieveQuoteTransformQueryConfig = {
  defaults: quoteFields,
  isList: false,
};
