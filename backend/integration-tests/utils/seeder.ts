export async function regionSeeder({ api, adminHeaders, data }) {
  return (
    await api.post(
      "/admin/regions",
      { name: "Test region", currency_code: "usd", ...data },
      adminHeaders
    )
  ).data.region;
}

export async function salesChannelSeeder({ api, adminHeaders, data }) {
  return (
    await api.post(
      `/admin/sales-channels`,
      { name: "test sales channel", ...data },
      adminHeaders
    )
  ).data.sales_channel;
}

export async function productSeeder({ api, adminHeaders, data }) {
  return (
    await api.post(
      "/admin/products",
      {
        title: `Test Product`,
        handle: `test-product`,
        options: [
          { title: "size", values: ["large", "small"] },
          { title: "color", values: ["green"] },
        ],
        variants: [
          {
            title: "Test variant",
            sku: "test-variant",
            manage_inventory: false,
            prices: [
              {
                currency_code: "usd",
                amount: 100,
              },
            ],
            options: {
              size: "large",
              color: "green",
            },
          },
        ],
      },
      adminHeaders
    )
  ).data.product;
}

export async function cartSeeder({ api, storeHeaders, data }) {
  return (
    await api.post(
      `/store/carts`,
      {
        currency_code: "usd",
        email: "tony@stark-industries.com",
        shipping_address: {
          address_1: "test address 1",
          address_2: "test address 2",
          city: "ny",
          country_code: "us",
          province: "ny",
          postal_code: "94016",
        },
        ...data,
      },
      storeHeaders
    )
  ).data.cart;
}
