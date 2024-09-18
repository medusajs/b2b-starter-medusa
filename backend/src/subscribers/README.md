# Custom subscribers

Subscribers handle events emitted in the Medusa application.

The subscriber is created in a TypeScript or JavaScript file under the `src/subscribers` directory.

For example, create the file `src/subscribers/product-created.ts` with the following content:

```ts
import {
  type SubscriberConfig,
} from "@medusajs/medusa"

// subscriber function
export default async function productCreateHandler() {
  console.log("A product was created")
}

// subscriber config
export const config: SubscriberConfig = {
  event: "product.created",
}
```

A subscriber file must export:

- The subscriber function that is an asynchronous function executed whenever the associated event is triggered.
- A configuration object defining the event this subscriber is listening to.

## Subscriber Parameters

A subscriber receives an object having the following properties:

- `event`: An object holding the event's details. It has a `data` property, which is the event's data payload.
- `container`: The Medusa container. Use it to resolve modules' main services and other registered resources.

```ts
import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/medusa"
import { IProductModuleService } from "@medusajs/types"
import { ModuleRegistrationName } from "@medusajs/utils"

export default async function productCreateHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const productId = data.id

  const productModuleService: IProductModuleService =
    container.resolve(ModuleRegistrationName.PRODUCT)

  const product = await productModuleService.retrieve(productId)

  console.log(`The product ${product.title} was created`)
}

export const config: SubscriberConfig = {
  event: "product.created",
}
```