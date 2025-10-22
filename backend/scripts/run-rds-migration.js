#!/usr/bin/env node
/**
 * Execute SQL Migration on RDS via SSH Tunnel
 * Usage: node scripts/run-rds-migration.js <migration-file>
 */

import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RDS_CONFIG = {
  host: '127.0.0.1',
  port: 59588,
  user: 'supabase_admin',
  password: 'po5lwIAe_kKb5Ham0nPr2qeah2CGDNys',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
};

async function runMigration(sqlFilePath) {
  const client = new Client(RDS_CONFIG);
  
  try {
    console.log('🔌 Conectando ao RDS via túnel SSH...');
    console.log(`📍 Host: ${RDS_CONFIG.host}:${RDS_CONFIG.port}`);
    console.log(`🗄️  Database: ${RDS_CONFIG.database}\n`);

    await client.connect();
    console.log('✅ Conexão estabelecida!\n');

    // Read SQL file
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(`📄 Executando migração: ${path.basename(sqlFilePath)}`);
    console.log(`📊 Tamanho: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

    // Execute migration
    console.log('⏳ Executando SQL...\n');
    await client.query(sqlContent);

    console.log('✅ Migração executada com sucesso!\n');

    // Validate tables created
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename LIKE 'catalog%'
      ORDER BY tablename
    `);

    console.log('📦 Tabelas/Views criadas:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.tablename}`);
    });

    // Check indexes
    const idxResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'catalog'
      ORDER BY indexname
    `);

    console.log(`\n🔍 Índices criados (${idxResult.rows.length}):`);
    idxResult.rows.forEach(row => {
      console.log(`   ✓ ${row.indexname}`);
    });

    console.log('\n🎉 Deploy da migração concluído!');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    if (error.message.includes('already exists')) {
      console.error('\n⚠️  Alguns objetos já existem (esperado em re-execução)');
      console.error('💡 Use DROP TABLE catalog CASCADE; para limpar e re-executar');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Uso: node run-rds-migration.js <migration-file>');
  console.error('Exemplo: node run-rds-migration.js database/migrations/003-create-catalog-table.sql');
  process.exit(1);
}

const migrationFile = path.resolve(args[0]);
if (!fs.existsSync(migrationFile)) {
  console.error(`❌ Arquivo não encontrado: ${migrationFile}`);
  process.exit(1);
}

runMigration(migrationFile);
