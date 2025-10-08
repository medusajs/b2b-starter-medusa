/**
 * @jest-environment node
 */

import compareAddresses from '@/lib/util/compare-addresses';

describe('compareAddresses', () => {
    const createAddress = (overrides = {}) => ({
        first_name: 'João',
        last_name: 'Silva',
        address_1: 'Rua das Flores, 123',
        address_2: 'Apto 45',
        company: 'YSH Solar',
        postal_code: '01234-567',
        city: 'São Paulo',
        country_code: 'BR',
        province: 'SP',
        phone: '(11) 98765-4321',
        ...overrides,
    });

    it('should return true for identical addresses', () => {
        const address1 = createAddress();
        const address2 = createAddress();

        expect(compareAddresses(address1, address2)).toBe(true);
    });

    it('should return true when only address_2 differs (not compared)', () => {
        const address1 = createAddress({ address_2: 'Apto 45' });
        const address2 = createAddress({ address_2: 'Apto 46' });

        expect(compareAddresses(address1, address2)).toBe(true);
    });

    it('should return false when first_name differs', () => {
        const address1 = createAddress({ first_name: 'João' });
        const address2 = createAddress({ first_name: 'Maria' });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should return false when last_name differs', () => {
        const address1 = createAddress({ last_name: 'Silva' });
        const address2 = createAddress({ last_name: 'Santos' });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should return false when address_1 differs', () => {
        const address1 = createAddress({ address_1: 'Rua das Flores, 123' });
        const address2 = createAddress({ address_1: 'Rua das Palmeiras, 456' });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should return false when company differs', () => {
        const address1 = createAddress({ company: 'YSH Solar' });
        const address2 = createAddress({ company: 'ABC Energy' });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should return false when postal_code differs', () => {
        const address1 = createAddress({ postal_code: '01234-567' });
        const address2 = createAddress({ postal_code: '98765-432' });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should return false when city differs', () => {
        const address1 = createAddress({ city: 'São Paulo' });
        const address2 = createAddress({ city: 'Rio de Janeiro' });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should return false when country_code differs', () => {
        const address1 = createAddress({ country_code: 'BR' });
        const address2 = createAddress({ country_code: 'US' });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should return false when province differs', () => {
        const address1 = createAddress({ province: 'SP' });
        const address2 = createAddress({ province: 'RJ' });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should return false when phone differs', () => {
        const address1 = createAddress({ phone: '(11) 98765-4321' });
        const address2 = createAddress({ phone: '(21) 99876-5432' });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should return true when addresses have extra fields not compared', () => {
        const address1 = createAddress({ metadata: { custom: 'value1' } });
        const address2 = createAddress({ metadata: { custom: 'value2' } });

        expect(compareAddresses(address1, address2)).toBe(true);
    });

    it('should handle undefined values in compared fields', () => {
        const address1 = createAddress({ company: undefined });
        const address2 = createAddress({ company: undefined });

        expect(compareAddresses(address1, address2)).toBe(true);
    });

    it('should return false when one has undefined and other has value', () => {
        const address1 = createAddress({ company: 'YSH Solar' });
        const address2 = createAddress({ company: undefined });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should handle null values in compared fields', () => {
        const address1 = createAddress({ company: null });
        const address2 = createAddress({ company: null });

        expect(compareAddresses(address1, address2)).toBe(true);
    });

    it('should return false when one has null and other has value', () => {
        const address1 = createAddress({ company: 'YSH Solar' });
        const address2 = createAddress({ company: null });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should handle empty string values', () => {
        const address1 = createAddress({ company: '' });
        const address2 = createAddress({ company: '' });

        expect(compareAddresses(address1, address2)).toBe(true);
    });

    it('should return false when one has empty string and other has value', () => {
        const address1 = createAddress({ company: 'YSH Solar' });
        const address2 = createAddress({ company: '' });

        expect(compareAddresses(address1, address2)).toBe(false);
    });

    it('should handle addresses with missing compared fields', () => {
        const address1 = { first_name: 'João', last_name: 'Silva' };
        const address2 = { first_name: 'João', last_name: 'Silva' };

        expect(compareAddresses(address1, address2)).toBe(true);
    });

    it('should return false when comparing partial addresses with different values', () => {
        const address1 = { first_name: 'João', city: 'São Paulo' };
        const address2 = { first_name: 'João', city: 'Rio de Janeiro' };

        expect(compareAddresses(address1, address2)).toBe(false);
    });
});
