
export const defaultStoreApprovalFields = [
  "id",
  "cart_id",
  "type",
  "status",
  "created_by",
  "handled_by",
  "handled_at",
  "rejection_reason",
  "priority",
  "created_at",
  "updated_at",
];

export const retrieveApprovalQueryConfig = {
  defaults: defaultStoreApprovalFields,
  allowed: [
    ...defaultStoreApprovalFields,
    "*cart",
    "*cart.items",
    "*cart.company",
  ],
});

export const listApprovalsQueryConfig = {
  defaults: defaultStoreApprovalFields,
  allowed: [
    ...defaultStoreApprovalFields,
    "*cart",
  ],
  defaultLimit: 15,
};
