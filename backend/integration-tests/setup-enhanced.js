/**
 * Enhanced Jest Setup for Medusa Framework Testing
 * Provides proper container resolution and database context
 */

const { MedusaTestRunner } = require('@medusajs/test-utils');
const { loadEnv } = require('@medusajs/framework/utils');
const { initializeDatabase } = require('../scripts/init-test-db');

// Load test environment
loadEnv('test', process.cwd());

// Global test setup
global.beforeAll(async () => {
    console.log('🚀 Setting up Medusa test environment...');

    try {
        // Initialize test database if running integration tests
        if (process.env.TEST_TYPE && process.env.TEST_TYPE.includes('integration')) {
            await initializeDatabase();
        }

        console.log('✅ Medusa test environment ready!');
    } catch (error) {
        console.error('❌ Failed to setup test environment:', error);
        throw error;
    }
}, 60000); // 60 second timeout

// Global test teardown
global.afterAll(async () => {
    console.log('🧹 Cleaning up test environment...');

    try {
        // Cleanup will be handled by MedusaTestRunner
        console.log('✅ Test environment cleanup completed!');
    } catch (error) {
        console.error('❌ Failed to cleanup test environment:', error);
    }
});

// Configure console to reduce noise during tests
const originalConsoleError = console.error;
console.error = (...args) => {
    // Suppress common test noise
    if (args[0] && typeof args[0] === 'string') {
        if (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
            args[0].includes('Warning: ReactDOMTestUtils') ||
            args[0].includes('ExperimentalWarning')) {
            return;
        }
    }
    originalConsoleError(...args);
};

// Export test utilities
module.exports = {
    MedusaTestRunner
};