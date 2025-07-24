import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import { deleteProductsFromAlgoliaWorkflow } from "../workflows/algolia/workflows/remove-products-from-algolia";

export default async function handleProductDeleted({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await deleteProductsFromAlgoliaWorkflow(container).run({
    input: {
      ids: [data.id],
    },
  });
}

export const config: SubscriberConfig = {
  event: "product.deleted",
};
