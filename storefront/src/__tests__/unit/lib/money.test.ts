/**
 * Money Utility Tests
 * 
 * Comprehensive test suite for currency formatting utility:
 * - BRL formatting
 * - Decimal precision handling
 * - Negative values
 * - Zero handling
 * - Large numbers
 * - Locale variations
 * - Edge cases
 */

import { convertToLocale } from '@/lib/util/money';

describe('convertToLocale', () => {
    describe('Basic BRL Formatting', () => {
        it('should format positive values in BRL', () => {
            const result = convertToLocale({
                amount: 1234.56,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 1.234,56');
        });

        it('should format integer values with decimal places', () => {
            const result = convertToLocale({
                amount: 1000,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 1.000,00');
        });

        it('should format small values correctly', () => {
            const result = convertToLocale({
                amount: 0.99,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 0,99');
        });

        it('should format values with cents', () => {
            const result = convertToLocale({
                amount: 25.5,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 25,50');
        });
    });

    describe('Large Numbers', () => {
        it('should format thousands correctly', () => {
            const result = convertToLocale({
                amount: 50000,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 50.000,00');
        });

        it('should format millions correctly', () => {
            const result = convertToLocale({
                amount: 1500000,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 1.500.000,00');
        });

        it('should format billions correctly', () => {
            const result = convertToLocale({
                amount: 2500000000,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 2.500.000.000,00');
        });

        it('should handle very large numbers', () => {
            const result = convertToLocale({
                amount: 999999999999.99,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 999.999.999.999,99');
        });
    });

    describe('Negative Values', () => {
        it('should format negative values', () => {
            const result = convertToLocale({
                amount: -1234.56,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('-R$ 1.234,56');
        });

        it('should format negative cents', () => {
            const result = convertToLocale({
                amount: -0.99,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('-R$ 0,99');
        });

        it('should format large negative values', () => {
            const result = convertToLocale({
                amount: -50000,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('-R$ 50.000,00');
        });
    });

    describe('Zero Handling', () => {
        it('should format zero correctly', () => {
            const result = convertToLocale({
                amount: 0,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 0,00');
        });

        it('should format negative zero', () => {
            const result = convertToLocale({
                amount: -0,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 0,00');
        });

        it('should format very small positive values', () => {
            const result = convertToLocale({
                amount: 0.01,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 0,01');
        });
    });

    describe('Decimal Precision', () => {
        it('should use minimumFractionDigits parameter', () => {
            const result = convertToLocale({
                amount: 100,
                currency_code: 'BRL',
                locale: 'pt-BR',
                minimumFractionDigits: 3,
            });

            expect(result).toBe('R$ 100,000');
        });

        it('should use maximumFractionDigits parameter', () => {
            const result = convertToLocale({
                amount: 100.999,
                currency_code: 'BRL',
                locale: 'pt-BR',
                maximumFractionDigits: 1,
            });

            expect(result).toBe('R$ 101,0');
        });

        it('should handle zero decimal places', () => {
            const result = convertToLocale({
                amount: 1234.56,
                currency_code: 'BRL',
                locale: 'pt-BR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });

            expect(result).toBe('R$ 1.235');
        });

        it('should handle many decimal places', () => {
            const result = convertToLocale({
                amount: 1234.56789,
                currency_code: 'BRL',
                locale: 'pt-BR',
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
            });

            expect(result).toBe('R$ 1.234,5679');
        });
    });

    describe('Different Locales', () => {
        it('should format in US locale', () => {
            const result = convertToLocale({
                amount: 1234.56,
                currency_code: 'USD',
                locale: 'en-US',
            });

            expect(result).toBe('$1,234.56');
        });

        it('should format in Euro locale', () => {
            const result = convertToLocale({
                amount: 1234.56,
                currency_code: 'EUR',
                locale: 'de-DE',
            });

            expect(result).toBe('1.234,56 €');
        });

        it('should default to en-US when locale not specified', () => {
            const result = convertToLocale({
                amount: 1234.56,
                currency_code: 'USD',
            });

            expect(result).toBe('$1,234.56');
        });
    });

    describe('Invalid/Empty Currency Code', () => {
        it('should return string value when currency_code is empty', () => {
            const result = convertToLocale({
                amount: 1234.56,
                currency_code: '',
                locale: 'pt-BR',
            });

            expect(result).toBe('1234.56');
        });

        it('should return string value when currency_code is null', () => {
            const result = convertToLocale({
                amount: 1234.56,
                currency_code: null as any,
                locale: 'pt-BR',
            });

            expect(result).toBe('1234.56');
        });

        it('should return string value when currency_code is undefined', () => {
            const result = convertToLocale({
                amount: 1234.56,
                currency_code: undefined as any,
                locale: 'pt-BR',
            });

            expect(result).toBe('1234.56');
        });
    });

    describe('Edge Cases', () => {
        it('should handle floating point precision issues', () => {
            const result = convertToLocale({
                amount: 0.1 + 0.2, // JavaScript: 0.30000000000000004
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 0,30');
        });

        it('should handle very small fractions', () => {
            const result = convertToLocale({
                amount: 0.001,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 0,00');
        });

        it('should round correctly', () => {
            const result = convertToLocale({
                amount: 1.995,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            // Should round to R$ 2,00
            expect(result).toBe('R$ 2,00');
        });

        it('should handle Infinity', () => {
            const result = convertToLocale({
                amount: Infinity,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toContain('∞');
        });

        it('should handle NaN', () => {
            const result = convertToLocale({
                amount: NaN,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toContain('NaN');
        });
    });

    describe('Real-world Solar Calculator Values', () => {
        it('should format typical kit price', () => {
            const result = convertToLocale({
                amount: 25000,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 25.000,00');
        });

        it('should format monthly savings', () => {
            const result = convertToLocale({
                amount: 450.75,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 450,75');
        });

        it('should format total 25-year savings', () => {
            const result = convertToLocale({
                amount: 180000,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 180.000,00');
        });

        it('should format financing monthly payment', () => {
            const result = convertToLocale({
                amount: 680.50,
                currency_code: 'BRL',
                locale: 'pt-BR',
            });

            expect(result).toBe('R$ 680,50');
        });
    });
});
