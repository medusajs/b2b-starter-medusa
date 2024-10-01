import {
  beginOrderEditOrderWorkflow,
  createOrdersWorkflow,
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
  function (input: {
    cart_id: string;
    customer_id: string;
  }): WorkflowResponse<any> {
    transform({ input }, ({ input }) => {
      console.log("input - ", input);
    });

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

    const customer = useRemoteQueryStep({
      entry_point: "customer",
      fields: ["id", "customer"],
      variables: { id: input.customer_id },
      list: false,
      throw_if_key_not_found: true,
    }).config({ name: "customer-query" });

    transform({ customer }, ({ customer }) => {
      console.log("customer - ", customer);
    });

    const orderInput = transform({ cart, customer }, ({ cart, customer }) => {
      return {
        is_draft_order: true,
        status: OrderStatus.DRAFT,
        sales_channel_id: cart.sales_channel_id,
        email: customer.email,
        customer_id: customer.id,
        billing_address: cart.billing_address,
        shipping_address: cart.shipping_address,
        items: cart.items,
        region_id: cart.region_id,
        promo_codes: cart.promotions.map(({ code }) => code),
        currency_code: cart.currency_code,
        shipping_methods: cart.shipping_methods,
      };
    });

    transform({ orderInput }, ({ orderInput }) => {
      console.log("orderInput - ", orderInput);
    });

    const draftOrder = createOrdersWorkflow.runAsStep({
      input: orderInput,
    });

    transform({ draftOrder }, ({ draftOrder }) => {
      console.log("draftOrder - ", draftOrder);
    });

    const orderEditInput = transform({ draftOrder }, ({ draftOrder }) => {
      return {
        order_id: draftOrder.id,
        description: "",
        internal_note: "",
        metadata: {},
      };
    });

    transform({ orderEditInput }, ({ orderEditInput }) => {
      console.log("orderEditInput - ", orderEditInput);
    });

    const changeOrder = beginOrderEditOrderWorkflow.runAsStep({
      input: orderEditInput,
    });

    transform({ changeOrder }, ({ changeOrder }) => {
      console.log("changeOrder - ", changeOrder);
    });

    const quotes = createQuotesWorkflow.runAsStep({
      input: [
        {
          draft_order_id: draftOrder.id,
          cart_id: cart.id,
          customer_id: customer.id,
          order_change_id: changeOrder.id,
        },
      ],
    });

    transform({ quotes }, ({ quotes }) => {
      console.log("quotes - ", quotes);
    });

    return new WorkflowResponse({
      quote: quotes[0],
    });
  }
);
