import {
  beginOrderEditOrderWorkflow,
  createOrdersWorkflow,
  orderEditAddNewItemWorkflow,
  requestOrderEditRequestWorkflow,
  useRemoteQueryStep,
} from "@medusajs/core-flows";
import { OrderStatus } from "@medusajs/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";
import { createQuotesWorkflow } from "./create-quote-workflow";

export const createRequestQuoteWorkflow = createWorkflow(
  "create-request-quote",
  function (input: { cart_id: string }): WorkflowResponse<any> {
    const cart = useRemoteQueryStep({
      entry_point: "cart",
      fields: [
        "id",
        "sales_channel_id",
        "currency_code",
        "region_id",
        "customer.id",
        "customer.email",
        "shipping_address.*",
        "billing_address.*",
        "items.*",
        "shipping_methods.*",
        "promotions.code",
      ],
      variables: { id: input.cart_id },
      list: false,
      throw_if_key_not_found: true,
    });

    const orderInput = transform({ cart }, ({ cart }) => {
      return {
        is_draft_order: true,
        status: OrderStatus.DRAFT,
        sales_channel_id: cart.sales_channel_id,
        email: cart.customer?.email,
        customer_id: cart.customer?.id,
        billing_address: cart.billing_address,
        shipping_address: cart.shipping_address,
        items: cart.items,
        region_id: cart.region_id,
        promo_codes: cart.promotions.map(({ code }) => code),
        currency_code: cart.currency_code,
        shipping_methods: cart.shipping_methods,
      };
    });

    const draftOrder = createOrdersWorkflow.runAsStep({
      input: orderInput,
    });

    const orderEditInput = transform({ draftOrder }, ({ draftOrder }) => {
      return {
        order_id: draftOrder.id,
        description: "",
        internal_note: "",
        metadata: {},
      };
    });

    const changeOrder = beginOrderEditOrderWorkflow.runAsStep({
      input: orderEditInput,
    });

    const orderEditAddItemsInput = transform(
      { draftOrder },
      ({ draftOrder }) => {
        return {
          order_id: draftOrder.id,
          items: (draftOrder.items || []).map((item) => {
            return {
              variant_id: item.variant_id!,
              quantity: item.quantity,
              unit_price: item.unit_price,
              internal_note: "",
              metadata: {},
            };
          }),
        };
      }
    );

    orderEditAddNewItemWorkflow.runAsStep({
      input: orderEditAddItemsInput,
    });

    requestOrderEditRequestWorkflow.runAsStep({
      input: {
        order_id: draftOrder.id,
        requested_by: "user_id",
      },
    });

    const quotes = createQuotesWorkflow.runAsStep({
      input: [
        {
          draft_order_id: draftOrder.id,
          cart_id: cart.id,
          order_change_id: changeOrder.id,
        },
      ],
    });

    return new WorkflowResponse({
      draftOrder,
      quote: quotes[0],
    });
  }
);
