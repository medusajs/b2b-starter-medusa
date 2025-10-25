// Query catalog statistics from RDS via EC2
import pkg from 'pg';
const { Client } = pkg;

const RDS_ENDPOINT = 'ysh-b2b-production-supabase-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com';
const RDS_CONFIG = {
  host: RDS_ENDPOINT,
  port: 5432,
  user: 'supabase_admin',
  password: 'po5lwIAe_kKb5Ham0nPr2qeah2CGDNys',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

async function queryCatalogStats() {
  const client = new Client(RDS_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao RDS produção\n');

    // Total de produtos
    const totalResult = await client.query('SELECT COUNT(*) as total FROM catalog');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`TOTAL DE PRODUTOS NO CATÁLOGO: ${totalResult.rows[0].total}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Por status
    const statusResult = await client.query(`
      SELECT is_active, COUNT(*) as count 
      FROM catalog 
      GROUP BY is_active 
      ORDER BY is_active DESC
    `);
    console.log('Distribuição por Status:');
    statusResult.rows.forEach(row => {
      console.log(`  ${row.is_active ? '✅ Ativos' : '❌ Inativos'}: ${row.count} produtos`);
    });

    // Por categoria
    const categoryResult = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM catalog 
      GROUP BY category 
      ORDER BY count DESC
    `);
    console.log(`\nDistribuição por Categoria (${categoryResult.rows.length} categorias):`);
    categoryResult.rows.forEach(row => {
      console.log(`  - ${row.category}: ${row.count} produtos`);
    });

    // Por fabricante
    const manufacturerResult = await client.query(`
      SELECT manufacturer, COUNT(*) as count 
      FROM catalog 
      GROUP BY manufacturer 
      ORDER BY count DESC
    `);
    console.log(`\nDistribuição por Fabricante (${manufacturerResult.rows.length} fabricantes):`);
    manufacturerResult.rows.forEach(row => {
      console.log(`  - ${row.manufacturer}: ${row.count} produtos`);
    });

    // Valor total
    const valueResult = await client.query(`
      SELECT SUM(price) as total_value 
      FROM catalog 
      WHERE is_active = true
    `);
    const totalValue = parseFloat(valueResult.rows[0].total_value);
    console.log(`\n💰 Valor Total em Estoque (ativos): R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

  } catch (error) {
    console.error('❌ Erro ao consultar catálogo:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

queryCatalogStats();
