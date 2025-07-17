import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createCustomerAccountWorkflow,
  createInventoryLevelsWorkflow,
  createLinksWorkflow,
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
  IApiKeyModuleService,
  IAuthModuleService,
  IFulfillmentModuleService,
  IInventoryService,
  ISalesChannelModuleService,
  IStoreModuleService,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import { COMPANY_MODULE } from "src/modules/company";
import { createEmployeesWorkflow } from "src/workflows/employee/workflows";
import { ModuleCompanySpendingLimitResetFrequency } from "../types/company";
import { createCompaniesWorkflow } from "../workflows/company/workflows";

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );
  const salesChannelModuleService: ISalesChannelModuleService =
    container.resolve(ModuleRegistrationName.SALES_CHANNEL);
  const storeModuleService: IStoreModuleService = container.resolve(
    ModuleRegistrationName.STORE
  );
  const authModuleService: IAuthModuleService = container.resolve(
    ModuleRegistrationName.AUTH
  );
  const inventoryModuleService: IInventoryService = container.resolve(
    ModuleRegistrationName.INVENTORY
  );
  const apiKeyModuleService: IApiKeyModuleService = container.resolve(
    ModuleRegistrationName.API_KEY
  );

  const countriesEU = ["de", "dk", "se", "fr", "es", "it"];
  const countriesUK = ["gb"];

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
            currency_code: "gbp",
          },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const {
    result: [regionEU],
  } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "EU",
          currency_code: "eur",
          countries: countriesEU,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const {
    result: [regionUK],
  } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "UK",
          currency_code: "gbp",
          countries: countriesUK,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: [...countriesEU, ...countriesUK].map((country_code) => ({
      country_code,
      provider_id: "tp_system",
      default_tax_rate: {
        name: "default",
        code: "default",
        rate: 0,
      },
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const {
    result: [stockLocationEU, stockLocationUK],
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "EU Warehouse",
          address: {
            city: "Amsterdam",
            country_code: "NL",
            address_1: "",
          },
        },
        {
          name: "UK Warehouse",
          address: {
            city: "London",
            country_code: "GB",
            address_1: "",
          },
        },
      ],
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocationEU.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocationUK.id,
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

  const fulfillmentSetEU = await fulfillmentModuleService.createFulfillmentSets(
    {
      name: "EU Warehouse delivery",
      type: "shipping",
      service_zones: [
        {
          name: "EU",
          geo_zones: [
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
    }
  );

  const fulfillmentSetUK = await fulfillmentModuleService.createFulfillmentSets(
    {
      name: "UK Warehouse delivery",
      type: "shipping",
      service_zones: [
        {
          name: "UK",
          geo_zones: [
            {
              country_code: "gb",
              type: "country",
            },
          ],
        },
      ],
    }
  );

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocationEU.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSetEU.id,
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocationUK.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSetUK.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSetEU.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            region_id: regionEU.id,
            amount: 0,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
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
        service_zone_id: fulfillmentSetEU.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            region_id: regionEU.id,
            amount: 0,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
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
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSetUK.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            region_id: regionUK.id,
            amount: 0,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
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
        service_zone_id: fulfillmentSetUK.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            region_id: regionUK.id,
            amount: 0,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
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
      id: stockLocationEU.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocationUK.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");

  const publishableApiKeys = await apiKeyModuleService.listApiKeys();

  const [publishableApiKey] =
    publishableApiKeys.length > 0
      ? publishableApiKeys
      : (
          await createApiKeysWorkflow(container).run({
            input: {
              api_keys: [
                {
                  title: "Webshop",
                  type: "publishable",
                  created_by: "",
                },
              ],
            },
          })
        ).result;

  // logger.log(`publishableApiKey: ${publishableApiKey.token}`);

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding company data...");

  const {
    result: [companyDE, companyUK],
  } = await createCompaniesWorkflow(container).run({
    input: [
      {
        name: "Muster GmbH",
        country: "de",
        currency_code: "eur",
        phone: "",
        email: "kontakt@muster.de",
        address: null,
        city: null,
        zip: null,
        state: null,
        logo_url: null,
        spending_limit_reset_frequency:
          ModuleCompanySpendingLimitResetFrequency.NEVER,
      },
      {
        name: "Example Ltd.",
        country: "gb",
        currency_code: "gbp",
        phone: "",
        email: "contact@example.co.uk",
        address: null,
        city: null,
        zip: null,
        state: null,
        logo_url: null,
        spending_limit_reset_frequency:
          ModuleCompanySpendingLimitResetFrequency.NEVER,
      },
    ],
  });

  const existingIdentities = await authModuleService.listAuthIdentities();
  const idsToDelete = existingIdentities
    .filter((i) => !i.app_metadata?.user_id)
    .map(({ id }) => id);

  await authModuleService.deleteAuthIdentities(idsToDelete);

  const [identityDE, identityUK] = await authModuleService.createAuthIdentities(
    [
      {
        provider_identities: [
          {
            provider: "emailpass",
            entity_id: "max@muster.de",
          },
        ],
      },
      {
        provider_identities: [
          {
            provider: "emailpass",
            entity_id: "john@example.co.uk",
          },
        ],
      },
    ]
  );

  const { result: customerDE } = await createCustomerAccountWorkflow(
    container
  ).run({
    input: {
      authIdentityId: identityDE.id,
      customerData: {
        email: "max@muster.de",
        has_account: true,
      },
    },
  });

  const { result: customerUK } = await createCustomerAccountWorkflow(
    container
  ).run({
    input: {
      authIdentityId: identityUK.id,
      customerData: {
        email: "john@example.co.uk",
        has_account: true,
      },
    },
  });

  await createEmployeesWorkflow(container).run({
    input: {
      customerId: customerDE.id,
      employeeData: {
        customer_id: customerDE.id,
        company_id: companyDE.id,
        spending_limit: 0,
        is_admin: true,
      },
    },
  });

  await createEmployeesWorkflow(container).run({
    input: {
      customerId: customerUK.id,
      employeeData: {
        customer_id: customerUK.id,
        company_id: companyUK.id,
        spending_limit: 0,
        is_admin: true,
      },
    },
  });

  await authModuleService.updateProvider("emailpass", {
    email: "max@muster.de",
    password: "1234",
    entity_id: "max@muster.de",
  });

  await authModuleService.updateProvider("emailpass", {
    email: "john@example.co.uk",
    password: "1234",
    entity_id: "john@example.co.uk",
  });

  logger.info("Finished seeding company data.");

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

  const {
    result: [productLaptop],
  } = await createProductsWorkflow(container).run({
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
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/laptop-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/laptop-side.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/laptop-top.png",
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
          shipping_profile_id: shippingProfile.id,
          variants: [
            {
              title: "256 GB / Blue",
              sku: "256-BLUE",
              options: {
                Storage: "256 GB",
                Color: "Blue",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
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
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
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

  const {
    result: [productWebcam],
  } = await createProductsWorkflow(container).run({
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
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/camera-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/camera-side.png",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Black", "White"],
            },
          ],
          shipping_profile_id: shippingProfile.id,
          variants: [
            {
              title: "Webcam Black",
              sku: "WEBCAM-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
                },
              ],
            },
            {
              title: "Webcam White",
              sku: "WEBCAM-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
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

  const {
    result: [productSmartphone],
  } = await createProductsWorkflow(container).run({
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
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/phone-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/phone-side.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/phone-bottom.png",
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
          shipping_profile_id: shippingProfile.id,
          variants: [
            {
              title: "256 GB Purple",
              sku: "PHONE-256-PURPLE",
              options: {
                Memory: "256 GB",
                Color: "Purple",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
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
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
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

  const {
    result: [productMonitor],
  } = await createProductsWorkflow(container).run({
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
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/screen-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/screen-side.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/screen-top.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/screen-back.png",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["White", "Black"],
            },
          ],
          shipping_profile_id: shippingProfile.id,
          variants: [
            {
              title: "ACME Monitor 4k White",
              sku: "ACME-MONITOR-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
                },
              ],
            },
            {
              title: "ACME Monitor 4k White",
              sku: "ACME-MONITOR-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
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

  const {
    result: [productHeadset],
  } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Hi-Fi Gaming Headset | Pro-Grade DAC | Hi-Res Certified",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Accessories")?.id!,
          ],
          description: `Experience studio-quality audio with this advanced acoustic system, which pairs premium hardware with high-fidelity sound and innovative audio software for an immersive listening experience. The integrated digital-to-analog converter (DAC) enhances the audio setup with high-resolution certification and a built-in amplifier, delivering exceptional sound clarity and depth. This comprehensive audio solution brings professional-grade sound to your personal environment, whether for gaming, music production, or general entertainment.`,
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/headphone-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/headphone-side.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/headphone-top.png",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Black", "White"],
            },
          ],
          shipping_profile_id: shippingProfile.id,
          variants: [
            {
              title: "Headphone Black",
              sku: "HEADPHONE-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
                },
              ],
            },
            {
              title: "Headphone White",
              sku: "HEADPHONE-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
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

  const {
    result: [productKeyboard],
  } = await createProductsWorkflow(container).run({
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
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/keyboard-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/keyboard-side.png",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Black", "White"],
            },
          ],
          shipping_profile_id: shippingProfile.id,
          variants: [
            {
              title: "Keyboard Black",
              sku: "KEYBOARD-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
                },
              ],
            },
            {
              title: "Keyboard White",
              sku: "KEYBOARD-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
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

  const {
    result: [productMouse],
  } = await createProductsWorkflow(container).run({
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
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/mouse-top.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/mouse-front.png",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Black", "White"],
            },
          ],
          shipping_profile_id: shippingProfile.id,
          variants: [
            {
              title: "Mouse Black",
              sku: "MOUSE-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
                },
              ],
            },
            {
              title: "Mouse White",
              sku: "MOUSE-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
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

  const {
    result: [productSpeaker],
  } = await createProductsWorkflow(container).run({
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
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/speaker-top.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/speaker-front.png",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Black", "White"],
            },
          ],
          shipping_profile_id: shippingProfile.id,
          variants: [
            {
              title: "Speaker Black",
              sku: "SPEAKER-BLACK",
              options: {
                Color: "Black",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
                },
              ],
            },
            {
              title: "Speaker White",
              sku: "SPEAKER-WHITE",
              options: {
                Color: "White",
              },
              manage_inventory: true,
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
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

  const inventoryItems = await inventoryModuleService.listInventoryItems(
    {},
    { select: ["id"], take: 20 }
  );

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.flatMap(({ id }) => [
        {
          inventory_item_id: id,
          location_id: stockLocationEU.id,
          stocked_quantity: 10,
        },
        {
          inventory_item_id: id,
          location_id: stockLocationUK.id,
          stocked_quantity: 10,
        },
      ]),
    },
  });

  // Bundled product
  const { data: productsWithInventory } = await query.graph({
    entity: "product",
    fields: ["variants.*", "variants.inventory_items.*"],
    filters: {
      id: [productMonitor.id, productKeyboard.id, productMouse.id],
    },
  });

  const inventoryItemIds = productsWithInventory.map((product) => ({
    inventory_item_id:
      product.variants[0].inventory_items?.[0]?.inventory_item_id!,
  }));

  const {
    result: [productBundleHomeOffice],
  } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: `Bundle Home Office`,
          collection_id: collection.id,
          description: "All-in-one bundle for enabling Home Office",
          weight: 1200,
          status: ProductStatus.PUBLISHED,
          images: [],
          options: [
            {
              title: "Default option",
              values: ["Default variant"],
            },
          ],
          shipping_profile_id: shippingProfile.id,
          variants: [
            {
              title: "Bundle",
              sku: "BUNDLE-HOME-OFFICE",
              prices: [
                {
                  amount: 0,
                  currency_code: "eur",
                },
                {
                  amount: 0,
                  currency_code: "gbp",
                },
              ],
              inventory_items: inventoryItemIds,
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

  await createLinksWorkflow(container).run({
    input: [
      {
        [COMPANY_MODULE]: {
          company_id: companyUK.id,
        },
        [Modules.PRODUCT]: {
          product_collection_id: collection.id,
        },
      },
      {
        [COMPANY_MODULE]: {
          company_id: companyUK.id,
        },
        [Modules.PRODUCT]: {
          product_id: productLaptop.id,
        },
      },
      {
        [COMPANY_MODULE]: {
          company_id: companyUK.id,
        },
        [Modules.PRODUCT]: {
          product_id: productMonitor.id,
        },
      },
      {
        [COMPANY_MODULE]: {
          company_id: companyUK.id,
        },
        [Modules.PRODUCT]: {
          product_id: productKeyboard.id,
        },
      },
      {
        [COMPANY_MODULE]: {
          company_id: companyUK.id,
        },
        [Modules.PRODUCT]: {
          product_id: productMouse.id,
        },
      },
      {
        [COMPANY_MODULE]: {
          company_id: companyUK.id,
        },
        [Modules.PRODUCT]: {
          product_id: productBundleHomeOffice.id,
        },
      },
      {
        [COMPANY_MODULE]: {
          company_id: companyDE.id,
        },
        [Modules.PRODUCT]: {
          product_id: productSmartphone.id,
        },
      },
      {
        [COMPANY_MODULE]: {
          company_id: companyDE.id,
        },
        [Modules.PRODUCT]: {
          product_id: productWebcam.id,
        },
      },
      {
        [COMPANY_MODULE]: {
          company_id: companyDE.id,
        },
        [Modules.PRODUCT]: {
          product_id: productHeadset.id,
        },
      },
      {
        [COMPANY_MODULE]: {
          company_id: companyDE.id,
        },
        [Modules.PRODUCT]: {
          product_id: productSpeaker.id,
        },
      },
    ],
  });

  logger.info("Finished seeding product data.");
}
