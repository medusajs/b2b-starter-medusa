import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import { syncProductsWorkflow } from "../workflows/algolia/workflows/sync-products";

export default async function handleProductEvents({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await syncProductsWorkflow(container).run({
    input: {
      filters: {
        id: data.id,
      },
    },
  });
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
};
