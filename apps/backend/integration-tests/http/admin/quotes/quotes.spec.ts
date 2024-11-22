import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import {
  adminHeaders,
  createAdminUser,
  createStoreUser,
} from "../../../utils/admin";
import {
  cartSeeder,
  productSeeder,
  regionSeeder,
  salesChannelSeeder,
} from "../../../utils/seeder";
import {
  generatePublishableKey,
  generateStoreHeaders,
} from "../../../utils/store";

jest.setTimeout(60 * 1000);

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api, getContainer }) => {
    let storeHeaders, cart, product, salesChannel, region, customerToken;

    beforeEach(async () => {
      const container = getContainer();
      await createAdminUser(adminHeaders, container);
      const publishableKey = await generatePublishableKey(container);
      storeHeaders = generateStoreHeaders({ publishableKey });
      const res = await createStoreUser({ api, storeHeaders });
      customerToken = res.token;
      storeHeaders.headers["Authorization"] = `Bearer ${customerToken}`;
      region = await regionSeeder({ api, adminHeaders, data: {} });

      salesChannel = await salesChannelSeeder({
        api,
        adminHeaders,
        data: {},
      });

      product = await productSeeder({
        api,
        adminHeaders,
        data: {
          sales_channels: [{ id: salesChannel.id }],
        },
      });

      await api.post(
        `/admin/api-keys/${publishableKey.id}/sales-channels`,
        { add: [salesChannel.id] },
        adminHeaders
      );

      cart = await cartSeeder({
        api,
        storeHeaders,
        data: {
          region_id: region.id,
          sales_channel_id: salesChannel.id,
          items: [{ quantity: 1, variant_id: product.variants[0].id }],
        },
      });
    });

    describe("POST /admin/quotes/:id/messages", () => {
      let quote1;

      beforeEach(async () => {
        const {
          data: { quote: newQuote },
        } = await api.post("/store/quotes", { cart_id: cart.id }, storeHeaders);

        quote1 = newQuote;
      });

      it("successfully creates an admin quote message", async () => {
        const {
          data: { quote },
        } = await api.post(
          `/admin/quotes/${quote1.id}/messages`,
          {
            text: "test message",
            item_id: cart.items[0].id,
          },
          adminHeaders
        );

        expect(quote).toEqual(
          expect.objectContaining({
            id: quote1.id,
            messages: [
              expect.objectContaining({
                text: "test message",
                item_id: cart.items[0].id,
                admin_id: expect.any(String),
                customer_id: null,
              }),
            ],
          })
        );
      });
    });
  },
});
