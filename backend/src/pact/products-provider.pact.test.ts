import { Verifier } from '@pact-foundation/pact';
import path from 'path';

/**
 * Pact Provider Verification - Products API
 * Verifies that backend (provider) implements contracts from storefront (consumer)
 */

describe('Products API - Provider Verification', () => {
    it('validates the expectations of ysh-storefront', async () => {
        const verifier = new Verifier({
            provider: 'ysh-backend',
            providerBaseUrl: 'http://localhost:9000',

            // Fetch pacts from Pact Broker
            pactBrokerUrl: 'http://localhost:9292',
            pactBrokerUsername: 'pact',
            pactBrokerPassword: 'pact',

            // Or load from local files during development
            // pactUrls: [
            //   path.resolve(__dirname, '../../storefront/pacts/ysh-storefront-ysh-backend.json'),
            // ],

            // Publish verification results
            publishVerificationResult: true,
            providerVersion: process.env.GIT_COMMIT || 'dev',
            providerVersionTags: ['main', 'dev'],

            // State handlers
            stateHandlers: {
                'produtos existem no catálogo': async () => {
                    // Ensure products exist in database
                    // This should be handled by seed data or test fixtures
                    console.log('State: Produtos existem no catálogo');
                    return Promise.resolve();
                },

                'produto prod_01JXXX existe': async () => {
                    // Ensure specific product exists
                    console.log('State: Produto prod_01JXXX existe');
                    return Promise.resolve();
                },

                'produto não existe': async () => {
                    // Ensure product doesn't exist (cleanup if needed)
                    console.log('State: Produto não existe');
                    return Promise.resolve();
                },
            },

            // Request filters to add authentication
            requestFilter: (req, res, next) => {
                // Add publishable key to all requests
                req.headers['x-publishable-api-key'] = process.env.MEDUSA_PUBLISHABLE_KEY || 'pk_test_xxx';
                next();
            },

            // Logging
            logLevel: 'info',

            // Timeout for verification
            timeout: 30000,
        });

        try {
            await verifier.verifyProvider();
            console.log('✅ Products API Provider Verification Complete');
        } catch (error) {
            console.error('❌ Products API Provider Verification Failed:', error);
            throw error;
        }
    }, 60000);
});
