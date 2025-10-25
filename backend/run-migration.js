import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Script para executar migração manualmente
async function runMigration() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error('DATABASE_URL não definida');
        process.exit(1);
    }

    // Parse DATABASE_URL (postgres://user:pass@host:port/db)
    const urlMatch = databaseUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!urlMatch) {
        console.error('DATABASE_URL inválida');
        process.exit(1);
    }

    const [, user, password, host, port, database] = urlMatch;

    try {
        console.log('Conectando ao banco de dados...');

        const client = new Client({
            host,
            port: parseInt(port),
            user,
            password,
            database,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        await client.connect();
        console.log('Conectado com sucesso!');

        // Ler arquivo de migração
        const migrationPath = path.join(process.cwd(), 'src/migrations/Migration20251013150000.ts');
        const migrationContent = fs.readFileSync(migrationPath, 'utf-8');

        // Extrair SQL das chamadas addSql
        const sqlMatches = migrationContent.match(/this\.addSql\(`([^`]+)`\)/g);
        if (!sqlMatches) {
            console.error('Nenhuma instrução SQL encontrada na migração');
            process.exit(1);
        }

        console.log(`Executando ${sqlMatches.length} instruções SQL...`);

        for (let i = 0; i < sqlMatches.length; i++) {
            const sqlMatch = sqlMatches[i];
            const sql = sqlMatch.replace(/this\.addSql\(`/g, '').replace(/`\);?$/g, '').trim();

            if (sql) {
                console.log(`Executando instrução ${i + 1}/${sqlMatches.length}...`);
                await client.query(sql);
            }
        }

        console.log('✅ Migração Phase 2 executada com sucesso!');
        console.log('Tabelas criadas:');
        console.log('- financing_proposal');
        console.log('- quote');
        console.log('- solar_calculation');
        console.log('- approval');
        console.log('- catalog_access_log');

        await client.end();

    } catch (error) {
        console.error('Erro na migração:', error);
        process.exit(1);
    }
}

runMigration();