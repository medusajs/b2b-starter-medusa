import { Verifier } from '@pact-foundation/pact';

/**
 * Pact Provider Verification - Quotes API
 * Verifies that backend (provider) implements contracts from storefront (consumer)
 */

describe('Quotes API - Provider Verification', () => {
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
                'carrinho cart_01JXXX existe': async () => {
                    // Ensure test cart exists for quote creation
                    console.log('State: Carrinho existe');
                    return Promise.resolve();
                },

                'quote quote_01JXXX existe': async () => {
                    // Create specific quote
                    console.log('State: Quote existe');
                    return Promise.resolve();
                },

                'customer tem cotações': async () => {
                    // Ensure customer has quotes
                    console.log('State: Customer tem cotações');
                    return Promise.resolve();
                },

                'quote quote_01JXXX foi respondida pelo merchant': async () => {
                    // Setup quote with merchant response
                    console.log('State: Quote respondida pelo merchant');
                    return Promise.resolve();
                },
            },

            // Request filters
            requestFilter: (req, res, next) => {
                req.headers['x-publishable-api-key'] = process.env.MEDUSA_PUBLISHABLE_KEY || 'pk_test_xxx';

                // All quote endpoints require authentication
                if (!req.headers.authorization) {
                    req.headers.authorization = `Bearer ${process.env.TEST_AUTH_TOKEN || 'test_token'}`;
                }

                next();
            },

            logLevel: 'info',
            timeout: 30000,
        });

        try {
            await verifier.verifyProvider();
            console.log('✅ Quotes API Provider Verification Complete');
        } catch (error) {
            console.error('❌ Quotes API Provider Verification Failed:', error);
            throw error;
        }
    }, 60000);
});
