import { Client } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const tableCheck = await client.query(
      `select to_regclass('public.fulfillment_shipping_price') as table_name`
    );
    console.log("table:", tableCheck.rows[0]);

    const cols = await client.query(
      `select column_name, data_type, is_nullable, column_default
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'fulfillment_shipping_price'
       order by ordinal_position`
    );

    console.log("columns:");
    console.table(cols.rows);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
}); 