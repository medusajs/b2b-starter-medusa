export const quoteFields = [
  "id",
  "draft_order.id",
  "draft_order.version",
  "draft_order.status",
  "draft_order.is_draft_order",
  "draft_order.summary.*",
  "draft_order.items.*",
  "draft_order.payment_collections.*",
];

export const retrieveQuoteTransformQueryConfig = {
  defaults: quoteFields,
  isList: false,
};
