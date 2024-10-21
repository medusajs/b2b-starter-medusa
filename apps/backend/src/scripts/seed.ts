import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/core-flows";
import {
  ExecArgs,
  IFulfillmentModuleService,
  ISalesChannelModuleService,
  IStoreModuleService,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import { Logger } from "@medusajs/medusa";
import { RemoteLink } from "@medusajs/modules-sdk";

export default async function seedDemoData({ container }: ExecArgs) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const remoteLink: RemoteLink = container.resolve(
    ContainerRegistrationKeys.REMOTE_LINK
  );
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );
  const salesChannelModuleService: ISalesChannelModuleService =
    container.resolve(ModuleRegistrationName.SALES_CHANNEL);
  const storeModuleService: IStoreModuleService = container.resolve(
    ModuleRegistrationName.STORE
  );

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: "eur",
            is_default: true,
          },
          {
            currency_code: "usd",
          },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await remoteLink.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const { result: shippingProfileResult } =
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default",
            type: "default",
          },
        ],
      },
    });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
        ],
      },
    ],
  });

  await remoteLink.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: '"true"',
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: '"true"',
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Webshop",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const {
    result: [collection],
  } = await createCollectionsWorkflow(container).run({
    input: {
      collections: [
        {
          title: "Featured",
          handle: "featured",
        },
      ],
    },
  });

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Laptops",
          is_active: true,
        },
        {
          name: "Accessories",
          is_active: true,
        },
        {
          name: "Phones",
          is_active: true,
        },
        {
          name: "Monitors",
          is_active: true,
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title:
            '16" Ultra-Slim AI Laptop | 3K OLED | 1.1cm Thin | 6-Speaker Audio',
          collection_id: collection.id,
          category_ids: [
            categoryResult.find((cat) => cat.name === "Laptops")?.id!,
          ],
          description:
            "This ultra-thin 16-inch laptop is a sophisticated, high-performance machine for the new era of artificial intelligence. It has been completely redesigned from the inside out. The cabinet features an exquisite new ceramic-aluminum composite material in a range of nature-inspired colors. This material provides durability while completing the ultra-slim design and resisting the test of time. This innovative computer utilizes the latest AI-enhanced processor with quiet ambient cooling. It's designed to enrich your lifestyle on the go with an astonishingly thin 1.1cm chassis that houses an advanced 16-inch 3K OLED display and immersive six-speaker audio.",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://github.com/user-attachments/assets/9983be01-3410-4ad3-8fa5-9cb841962613",
            },
            {
              url: "https://github.com/user-attachments/assets/14c81d86-4112-4c6f-b0e2-95e8081ed515",
            },
            {
              url: "https://github.com/user-attachments/assets/55980fe8-98f5-4746-9ae2-bd7ba3ba15c2",
            },
            {
              url: "https://github.com/user-attachments/assets/933c4bf4-0e1e-491d-91c3-dd5b0b040b88",
            },
          ],
          options: [
            {
              title: "Storage",
              values: ["256 GB", "512 GB"],
            },
            {
              title: "Color",
              values: ["Blue", "Red"],
            },
          ],
          variants: [
            {
              title: "256 GB / Blue",
              sku: "256-BLUE",
              options: {
                Storage: "256 GB",
                Color: "Blue",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 1299,
                  currency_code: "eur",
                },
                {
                  amount: 1299,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "512 GB / Red",
              sku: "512-RED",
              options: {
                Storage: "512 GB",
                Color: "Red",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 1259,
                  currency_code: "eur",
                },
                {
                  amount: 1259,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "1080p HD Pro Webcam | Superior Video | Privacy enabled",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Accessories")?.id!,
          ],
          description:
            "High-quality 1080p HD webcam that elevates your work environment with superior video and audio that outperforms standard laptop cameras. Achieve top-tier video collaboration at a cost-effective price point, ideal for widespread deployment across your organization.",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://github.com/user-attachments/assets/6454d529-7d02-48ae-90e5-aa65d9024361",
            },
            {
              url: "https://github.com/user-attachments/assets/14cab9e7-9ec1-4e59-9030-ef67cbbf501b",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Black", "White"],
            },
          ],
          variants: [
            {
              title: "Webcam Black",
              sku: "WEBCAM-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 59,
                  currency_code: "eur",
                },
                {
                  amount: 59,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Webcam White",
              sku: "WEBCAM-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 65,
                  currency_code: "eur",
                },
                {
                  amount: 65,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: `6.5" Ultra HD Smartphone | 3x Impact-Resistant Screen`,
          collection_id: collection.id,
          category_ids: [
            categoryResult.find((cat) => cat.name === "Phones")?.id!,
          ],
          description:
            'This premium smartphone is crafted from durable and lightweight aerospace-grade aluminum, featuring an expansive 6.5" Ultra-High Definition AMOLED display. It boasts exceptional durability with a cutting-edge nanocrystal glass front, offering three times the impact resistance of standard smartphone screens. The device combines sleek design with robust protection, setting a new standard for smartphone resilience and visual excellence. Copy',
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://github.com/user-attachments/assets/11cc1538-1188-4edc-a30c-0352337c0c75",
            },
            {
              url: "https://github.com/user-attachments/assets/4badb86a-fb08-4d92-8db7-4aa5bde94ad6",
            },
            {
              url: "https://github.com/user-attachments/assets/55c212ee-434b-4744-af99-701cf14bd90c",
            },
          ],
          options: [
            {
              title: "Memory",
              values: ["256 GB", "512 GB"],
            },
            {
              title: "Color",
              values: ["Purple", "Red"],
            },
          ],
          variants: [
            {
              title: "256 GB Purple",
              sku: "PHONE-256-PURPLE",
              options: {
                Memory: "256 GB",
                Color: "Purple",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 999,
                  currency_code: "eur",
                },
                {
                  amount: 999,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "256 GB Red",
              sku: "PHONE-256-RED",
              options: {
                Memory: "256 GB",
                Color: "Red",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 959,
                  currency_code: "eur",
                },
                {
                  amount: 959,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: `34" QD-OLED Curved Gaming Monitor | Ultra-Wide | Infinite Contrast | 175Hz`,
          collection_id: collection.id,
          category_ids: [
            categoryResult.find((cat) => cat.name === "Monitors")?.id!,
          ],
          description:
            "Experience the pinnacle of display technology with this 34-inch curved monitor. By merging OLED panels and Quantum Dot technology, this QD-OLED screen delivers exceptional contrast, deep blacks, unlimited viewing angles, and vivid colors. The curved design provides an immersive experience, allowing you to enjoy the best of both worlds in one cutting-edge display. This innovative monitor represents the ultimate fusion of visual performance and immersive design.",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://github.com/user-attachments/assets/b0864cfb-0f00-415b-b7de-dfb2e8485876",
            },
            {
              url: "https://github.com/user-attachments/assets/f6d1b7a9-2c66-47ca-a21c-b58a176d91f8",
            },
            {
              url: "https://github.com/user-attachments/assets/8013af0a-07d6-45ec-b411-e8bf2dfe9d54",
            },
            {
              url: "https://github.com/user-attachments/assets/ac665c8e-0977-425e-bff3-fbad414e21d8",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["White", "Black"],
            },
          ],
          variants: [
            {
              title: "ACME Monitor 4k White",
              sku: "ACME-MONITOR-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 599,
                  currency_code: "eur",
                },
                {
                  amount: 599,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "ACME Monitor 4k White",
              sku: "ACME-MONITOR-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 599,
                  currency_code: "eur",
                },
                {
                  amount: 599,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Hi-Fi Gaming Headset | Pro-Grade DAC | Hi-Res Certified",
          collection_id: collection.id,
          category_ids: [
            categoryResult.find((cat) => cat.name === "Accessories")?.id!,
          ],
          description: `Experience studio-quality audio with this advanced acoustic system, which pairs premium hardware with high-fidelity sound and innovative audio software for an immersive listening experience. The integrated digital-to-analog converter (DAC) enhances the audio setup with high-resolution certification and a built-in amplifier, delivering exceptional sound clarity and depth. This comprehensive audio solution brings professional-grade sound to your personal environment, whether for gaming, music production, or general entertainment.`,
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://github.com/user-attachments/assets/ee793a4f-4926-48d5-9a1b-c571b96eef27",
            },
            {
              url: "https://github.com/user-attachments/assets/4c9a0a27-7c9e-4a5b-9c6a-4002ec55812e",
            },
            {
              url: "https://github.com/user-attachments/assets/0d4dd248-36b3-4afa-bfdc-ef3d477e96d8",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Black", "White"],
            },
          ],
          variants: [
            {
              title: "Headphone Black",
              sku: "HEADPHONE-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 149,
                  currency_code: "eur",
                },
                {
                  amount: 149,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Headphone White",
              sku: "HEADPHONE-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 149,
                  currency_code: "eur",
                },
                {
                  amount: 149,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Wireless Keyboard | Touch ID | Numeric Keypad",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Accessories")?.id!,
          ],
          description: `This wireless keyboard offers a comfortable typing experience with a numeric keypad and Touch ID. It features navigation buttons, full-sized arrow keys, and is ideal for spreadsheets and gaming. The rechargeable battery lasts about a month. It pairs automatically with compatible computers and includes a USB-C to Lightning cable for charging and pairing.`,
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://github.com/user-attachments/assets/09f58af0-3e91-4dff-b0f3-58990d3385ba",
            },
            {
              url: "https://github.com/user-attachments/assets/f01eb303-5167-4e24-b34f-a4bdae7cbe3b",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Black", "White"],
            },
          ],
          variants: [
            {
              title: "Keyboard Black",
              sku: "KEYBOARD-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 99,
                  currency_code: "eur",
                },
                {
                  amount: 99,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Keyboard White",
              sku: "KEYBOARD-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 99,
                  currency_code: "eur",
                },
                {
                  amount: 99,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Wireless Rechargeable Mouse | Multi-Touch Surface",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Accessories")?.id!,
          ],
          description: `This wireless keyboard offers a comfortable typing experience with a numeric keypad and Touch ID. It features navigation buttons, full-sized arrow keys, and is ideal for spreadsheets and gaming. The rechargeable battery lasts about a month. It pairs automatically with compatible computers and includes a USB-C to Lightning cable for charging and pairing.`,
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://github.com/user-attachments/assets/1b58546a-63a8-45ab-aaac-8954627d521e",
            },
            {
              url: "https://github.com/user-attachments/assets/b8969ab4-902a-4cc9-bbd7-8892974f4678",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Black", "White"],
            },
          ],
          variants: [
            {
              title: "Mouse Black",
              sku: "MOUSE-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 79,
                  currency_code: "eur",
                },
                {
                  amount: 79,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Mouse White",
              sku: "MOUSE-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 79,
                  currency_code: "eur",
                },
                {
                  amount: 79,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Conference Speaker | High-Performance | Budget-Friendly",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Accessories")?.id!,
          ],
          description: `This compact, powerful conference speaker offers exceptional, high-performance features at a surprisingly affordable price. Packed with advanced productivity-enhancing technology, it delivers premium functionality without the premium price tag. Experience better meetings and improved communication, regardless of where your team members are calling from.`,
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://github.com/user-attachments/assets/4347381d-c34d-4dc2-8fa3-4dee9eeffe4e",
            },
            {
              url: "https://github.com/user-attachments/assets/d2a2f60b-5a7a-4cd4-a0ba-ed771859ceb3",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Black", "White"],
            },
          ],
          variants: [
            {
              title: "Speaker Black",
              sku: "SPEAKER-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 79,
                  currency_code: "eur",
                },
                {
                  amount: 79,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Speaker White",
              sku: "SPEAKER-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: false,
              prices: [
                {
                  amount: 55,
                  currency_code: "eur",
                },
                {
                  amount: 55,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");
}
