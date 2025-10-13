import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        console.log('Conectado ao banco de dados');

        const result = await client.query(`
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        `);

        console.log('\nTabelas encontradas:');
        const tables = result.rows.map(row => row.tablename);
        tables.forEach(table => console.log(`- ${table}`));

        // Verificar tabelas específicas da migração
        const expectedTables = [
            'lead',
            'event',
            'rag_query',
            'helio_conversation',
            'photogrammetry_analysis'
        ];

        console.log('\nVerificação das tabelas da migração:');
        expectedTables.forEach(table => {
            if (tables.includes(table)) {
                console.log(`✅ ${table} - CRIADA`);
            } else {
                console.log(`❌ ${table} - FALTANDO`);
            }
        });

        // Verificar estrutura de uma tabela
        if (tables.includes('lead')) {
            const columnsResult = await client.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'lead'
                ORDER BY ordinal_position;
            `);

            console.log('\nEstrutura da tabela lead:');
            columnsResult.rows.forEach(col => {
                console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
            });
        }

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await client.end();
    }
}

checkTables();