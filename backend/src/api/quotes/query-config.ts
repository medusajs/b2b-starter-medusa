import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultQuoteFields = [
    "id",
    "status",
    "draft_order_id",
    "customer_id",
    "cart_id",
    "created_at",
    "updated_at",
];

export const defaultQuoteRelations = [
    "customer",
    "cart",
    "draft_order",
    "messages",
];

export const listQuotesQueryConfig = defineQueryConfig({
    defaults: defaultQuoteFields,
    allowed: [
        ...defaultQuoteFields,
        ...defaultQuoteRelations,
    ],
    defaultLimit: 15,
});

export const retrieveQuoteQueryConfig = defineQueryConfig({
    defaults: [...defaultQuoteFields, ...defaultQuoteRelations],
    allowed: [
        ...defaultQuoteFields,
        ...defaultQuoteRelations,
    ],
});