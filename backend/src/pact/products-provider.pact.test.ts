import { verifyPacts } from './setup';

/**
 * Pact Provider Verification - Products API
 * Verifies that backend (provider) implements contracts from storefront (consumer)
 */

describe('Products API - Provider Verification', () => {
    it('validates the expectations of ysh-storefront', async () => {
        await verifyPacts({
            provider: 'ysh-backend-products',
            providerBaseUrl: process.env.BACKEND_URL || 'http://localhost:9000',
            publishVerificationResult: false,
        });
    }, 60000);
});

