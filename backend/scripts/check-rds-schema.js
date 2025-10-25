#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: '127.0.0.1',
  port: 59588,
  user: 'supabase_admin',
  password: 'po5lwIAe_kKb5Ham0nPr2qeah2CGDNys',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='catalog' ORDER BY ordinal_position`))
  .then(r => {
    console.log('Colunas da tabela catalog no RDS:');
    r.rows.forEach(row => console.log(`  - ${row.column_name} (${row.data_type})`));
    client.end();
  })
  .catch(e => {
    console.error(e.message);
    client.end();
  });
