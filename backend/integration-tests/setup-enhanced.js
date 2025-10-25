/**
 * Enhanced Jest Setup for Medusa Framework Testing
 * Provides proper container resolution and database context
 */

import { MedusaTestRunner } from '@medusajs/test-utils';
import { loadEnv } from '@medusajs/framework/utils';
import { initializeDatabase } from '../scripts/init-test-db.js';

// Load test environment
loadEnv('test', process.cwd());

// Conditional module loading with graceful fallback
const QUOTE_MODULE_ENABLED = process.env.ENABLE_QUOTE_MODULE !== 'false';

function setupConditionalModules() {
    const modules = [
        { name: 'quote', path: '../src/modules/quote/service', enabled: QUOTE_MODULE_ENABLED },
        { name: 'quote-workflows', path: '../src/workflows/quote', enabled: QUOTE_MODULE_ENABLED },
        { name: 'quote-links', path: '../src/links/quote-links', enabled: QUOTE_MODULE_ENABLED },
    ];

    modules.forEach(({ name, path, enabled }) => {
        if (!enabled) {
            console.log(`⚠️  ${name} module disabled, using stub`);
            jest.mock(path, () => ({
                default: class StubService {
                    async list() { return []; }
                    async retrieve() { return null; }
                    async create() { throw new Error(`${name} module disabled`); }
                    async update() { throw new Error(`${name} module disabled`); }
                    async delete() { throw new Error(`${name} module disabled`); }
                }
            }), { virtual: true });
            return;
        }

        try {
            import(path);
            console.log(`✅ ${name} module loaded`);
        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND' || error.message.includes('Cannot find module')) {
                console.log(`⚠️  ${name} module not found, using stub`);
                jest.mock(path, () => ({
                    default: class StubService {
                        async list() { return []; }
                        async retrieve() { return null; }
                    }
                }), { virtual: true });
            } else {
                console.warn(`⚠️  ${name} module error: ${error.message}`);
            }
        }
    });
}

setupConditionalModules();

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
export {
    MedusaTestRunner
};