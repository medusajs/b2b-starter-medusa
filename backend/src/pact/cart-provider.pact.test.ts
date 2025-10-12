import { Verifier } from '@pact-foundation/pact';

/**
 * Pact Provider Verification - Cart API
 * Verifies that backend (provider) implements contracts from storefront (consumer)
 */

describe('Cart API - Provider Verification', () => {
    it('validates the expectations of ysh-storefront', async () => {
        const verifier = new Verifier({
            provider: 'ysh-backend',
            providerBaseUrl: 'http://localhost:9000',

            // Fetch pacts from Pact Broker
            pactBrokerUrl: 'http://localhost:9292',
            pactBrokerUsername: 'pact',
            pactBrokerPassword: 'pact',

            // Publish verification results
            publishVerificationResult: true,
            providerVersion: process.env.GIT_COMMIT || 'dev',
            providerVersionTags: ['main', 'dev'],

            // State handlers
            stateHandlers: {
                'region BR existe': async () => {
                    // Ensure BR region exists
                    console.log('State: Region BR existe');
                    return Promise.resolve();
                },

                'carrinho cart_01JXXX existe e produto variant_01JXXX está disponível': async () => {
                    // Create test cart and ensure product variant is available
                    console.log('State: Carrinho e produto disponíveis');
                    return Promise.resolve();
                },

                'carrinho cart_01JXXX tem item item_01JXXX': async () => {
                    // Ensure cart has specific item
                    console.log('State: Carrinho tem item');
                    return Promise.resolve();
                },

                'carrinho cart_01JXXX está pronto para checkout e aprovado': async () => {
                    // Setup cart ready for checkout with approvals
                    console.log('State: Carrinho pronto para checkout');
                    return Promise.resolve();
                },
            },

            // Request filters
            requestFilter: (req, res, next) => {
                req.headers['x-publishable-api-key'] = process.env.MEDUSA_PUBLISHABLE_KEY || 'pk_test_xxx';

                // Add auth token for authenticated endpoints
                if (req.headers.authorization) {
                    req.headers.authorization = `Bearer ${process.env.TEST_AUTH_TOKEN || 'test_token'}`;
                }

                next();
            },

            logLevel: 'info',
            timeout: 30000,
        });

        try {
            await verifier.verifyProvider();
            console.log('✅ Cart API Provider Verification Complete');
        } catch (error) {
            console.error('❌ Cart API Provider Verification Failed:', error);
            throw error;
        }
    }, 60000);
});
