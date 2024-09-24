export const quoteFields = [
  "id",
  "cart.id",
  "draft_order.id",
  "draft_order.version",
  "draft_order.status",
  "draft_order.is_draft_order",
  "draft_order.summary.*",
  "draft_order.items.*",
  "order_change.*",
  "order_change.actions.*",
];

export const retrieveQuoteTransformQueryConfig = {
  defaults: quoteFields,
  isList: false,
};
