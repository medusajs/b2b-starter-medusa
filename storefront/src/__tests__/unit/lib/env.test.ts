/**
 * @jest-environment node
 */

import { getBaseURL } from '@/lib/util/env';

describe('getBaseURL', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should return NEXT_PUBLIC_SITE_URL when available', () => {
        process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-domain.com';
        process.env.NEXT_PUBLIC_VERCEL_URL = 'vercel-app.vercel.app';

        const result = getBaseURL();
        expect(result).toBe('https://custom-domain.com');
    });

    it('should return Vercel URL when SITE_URL is not available', () => {
        delete process.env.NEXT_PUBLIC_SITE_URL;
        process.env.NEXT_PUBLIC_VERCEL_URL = 'my-app.vercel.app';

        const result = getBaseURL();
        expect(result).toBe('https://my-app.vercel.app');
    });

    it('should return default domain when no env vars are set', () => {
        delete process.env.NEXT_PUBLIC_SITE_URL;
        delete process.env.NEXT_PUBLIC_VERCEL_URL;

        const result = getBaseURL();
        expect(result).toBe('https://yellosolarhub.com');
    });

    it('should prefer SITE_URL over VERCEL_URL', () => {
        process.env.NEXT_PUBLIC_SITE_URL = 'https://production.com';
        process.env.NEXT_PUBLIC_VERCEL_URL = 'preview.vercel.app';

        const result = getBaseURL();
        expect(result).toBe('https://production.com');
    });

    it('should handle SITE_URL with trailing slash', () => {
        process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/';

        const result = getBaseURL();
        expect(result).toBe('https://example.com/');
    });

    it('should add https protocol to VERCEL_URL', () => {
        delete process.env.NEXT_PUBLIC_SITE_URL;
        process.env.NEXT_PUBLIC_VERCEL_URL = 'app.vercel.app';

        const result = getBaseURL();
        expect(result).toContain('https://');
        expect(result).toBe('https://app.vercel.app');
    });

    it('should handle empty SITE_URL', () => {
        process.env.NEXT_PUBLIC_SITE_URL = '';
        process.env.NEXT_PUBLIC_VERCEL_URL = 'vercel.vercel.app';

        const result = getBaseURL();
        // Empty string is falsy, so it should use VERCEL_URL
        expect(result).toBe('https://vercel.vercel.app');
    });

    it('should handle empty VERCEL_URL', () => {
        delete process.env.NEXT_PUBLIC_SITE_URL;
        process.env.NEXT_PUBLIC_VERCEL_URL = '';

        const result = getBaseURL();
        // Empty string is falsy, so it should use default
        expect(result).toBe('https://yellosolarhub.com');
    });

    it('should return consistent results on multiple calls', () => {
        process.env.NEXT_PUBLIC_SITE_URL = 'https://consistent.com';

        const result1 = getBaseURL();
        const result2 = getBaseURL();
        const result3 = getBaseURL();

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
    });

    it('should handle localhost SITE_URL', () => {
        process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';

        const result = getBaseURL();
        expect(result).toBe('http://localhost:3000');
    });

    it('should handle VERCEL_URL with preview deployments', () => {
        delete process.env.NEXT_PUBLIC_SITE_URL;
        process.env.NEXT_PUBLIC_VERCEL_URL = 'my-app-git-feature-team.vercel.app';

        const result = getBaseURL();
        expect(result).toBe('https://my-app-git-feature-team.vercel.app');
    });

    it('should return default for production fallback', () => {
        // Simulate production environment with no env vars
        delete process.env.NEXT_PUBLIC_SITE_URL;
        delete process.env.NEXT_PUBLIC_VERCEL_URL;

        const result = getBaseURL();
        expect(result).toBe('https://yellosolarhub.com');
        expect(result).toContain('https://');
    });
});
