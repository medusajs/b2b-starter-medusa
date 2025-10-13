#!/usr/bin/env node

/**
 * Test Database Initialization Script
 * Sets up PostgreSQL database for testing with proper schema and initial data
 */

const { execSync } = require('child_process');
const { Client } = require('pg');

const TEST_DB_CONFIG = {
    host: 'localhost',
    port: 5433,
    database: 'medusa_test',
    user: 'postgres',
    password: 'postgres'
};

const DB_URL = `postgresql://${TEST_DB_CONFIG.user}:${TEST_DB_CONFIG.password}@${TEST_DB_CONFIG.host}:${TEST_DB_CONFIG.port}/${TEST_DB_CONFIG.database}`;

async function waitForDatabase(maxRetries = 30, delay = 1000) {
    console.log('⏳ Waiting for test database to be ready...');

    for (let i = 0; i < maxRetries; i++) {
        try {
            const client = new Client(TEST_DB_CONFIG);
            await client.connect();
            await client.query('SELECT 1');
            await client.end();
            console.log('✅ Test database is ready!');
            return true;
        } catch (error) {
            console.log(`⏳ Attempt ${i + 1}/${maxRetries} - Database not ready yet...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    console.error('❌ Test database failed to start within timeout');
    return false;
}

async function initializeDatabase() {
    try {
        console.log('🚀 Initializing test database...');

        // Wait for database to be ready
        const dbReady = await waitForDatabase();
        if (!dbReady) {
            process.exit(1);
        }

        // Run Medusa migrations
        console.log('📦 Running database migrations...');
        execSync('npm run migrate', {
            stdio: 'inherit',
            env: {
                ...process.env,
                DATABASE_URL: DB_URL,
                NODE_ENV: 'test'
            }
        });

        // Run seed data
        console.log('🌱 Seeding test data...');
        execSync('npm run seed', {
            stdio: 'inherit',
            env: {
                ...process.env,
                DATABASE_URL: DB_URL,
                NODE_ENV: 'test'
            }
        });

        console.log('✅ Test database initialization completed successfully!');
        console.log(`📍 Database URL: ${DB_URL}`);

    } catch (error) {
        console.error('❌ Failed to initialize test database:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase, waitForDatabase, TEST_DB_CONFIG };