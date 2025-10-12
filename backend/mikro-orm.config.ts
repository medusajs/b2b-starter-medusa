import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';
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
        generator: {
            // Use custom generator for Medusa compatibility
            type: 'postgresql',
        },
    },

    // Seeding
    seeder: {
        path: './src/seeders',
        pathTs: './src/seeders',
        defaultSeeder: 'DatabaseSeeder',
        glob: '!(*.d).{js,ts}',
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
    extensions: [Migrator, SeedManager],

    // Connection Pool
    pool: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 60000,
    },

    // Cache
    cache: {
        enabled: true,
        pretty: true,
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

    // Naming Strategy (snake_case for DB, camelCase for TS)
    namingStrategy: class extends (class { }) {
        classToTableName(entityName: string): string {
            return entityName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        }

        propertyToColumnName(propertyName: string): string {
            return propertyName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        }

        joinKeyColumnName(entityName: string, referencedColumnName?: string): string {
            return `${entityName.toLowerCase()}_${referencedColumnName || 'id'}`;
        }
    },
});
