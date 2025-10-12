import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { AbstractNamingStrategy } from '@mikro-orm/core';
import path from 'path';

/**
 * Mikro-ORM Configuration for Medusa 2.10.3
 * 
 * Integração completa com:
 * - 12 módulos customizados
 * - RemoteLink para relacionamentos cross-module
 * - Migrations automáticas
 * - Seeding de dados
 */

export default defineConfig({
    // Database Connection
    clientUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ysh_medusa',

    // Entity Discovery
    entities: ['./dist/modules/**/*.js', './dist/entities/**/*.js'],
    entitiesTs: ['./src/modules/**/*.ts', './src/entities/**/*.ts'],

    // Migrations
    migrations: {
        path: './src/migrations',
        pathTs: './src/migrations',
        glob: '!(*.d).{js,ts}',
        transactional: true,
        disableForeignKeys: false,
        allOrNothing: true,
        dropTables: false,
        safe: true,
        snapshot: true,
        emit: 'ts',
    },

    // Debug & Logging
    debug: process.env.NODE_ENV === 'development',
    logger: console.log.bind(console),

    // Schema Management
    schemaGenerator: {
        disableForeignKeys: false,
        createForeignKeyConstraints: true,
        ignoreSchema: [],
    },

    // Discovery
    discovery: {
        warnWhenNoEntities: true,
        requireEntitiesArray: false,
        alwaysAnalyseProperties: true,
    },

    // Extensions
    extensions: [Migrator],

    // Connection Pool
    pool: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 60000,
    },

    // Metadata
    metadataCache: {
        enabled: process.env.NODE_ENV === 'production',
        pretty: false,
        options: {
            cacheDir: path.join(__dirname, '.mikro-orm-cache'),
        },
    },

    // Timezone & Type Safety
    timezone: 'America/Sao_Paulo',
    forceUtcTimezone: false,
    strict: true,
    validate: true,

    // Naming Strategy: Use UnderscoreNamingStrategy (snake_case)
    // This is compatible with Medusa's existing naming
});
