import { Verifier } from '@pact-foundation/pact';

/**
 * Pact Provider Verification - Approvals API
 * Verifies that backend (provider) implements contracts from storefront (consumer)
 */

describe('Approvals API - Provider Verification', () => {
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
                'employee tem aprovações pendentes': async () => {
                    // Setup test employee with pending approvals
                    console.log('State: Employee tem aprovações pendentes');
                    return Promise.resolve();
                },

                'approval appr_01JXXX está pendente e employee é aprovador': async () => {
                    // Create specific approval and ensure employee can approve
                    console.log('State: Approval pendente e employee é aprovador');
                    return Promise.resolve();
                },

                'approval appr_01JXXX existe': async () => {
                    // Ensure specific approval exists
                    console.log('State: Approval existe');
                    return Promise.resolve();
                },
            },

            // Request filters
            requestFilter: (req, res, next) => {
                req.headers['x-publishable-api-key'] = process.env.MEDUSA_PUBLISHABLE_KEY || 'pk_test_xxx';

                // All approval endpoints require authentication
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
            console.log('✅ Approvals API Provider Verification Complete');
        } catch (error) {
            console.error('❌ Approvals API Provider Verification Failed:', error);
            throw error;
        }
    }, 60000);
});
