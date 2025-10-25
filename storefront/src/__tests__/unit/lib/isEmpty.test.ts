/**
 * @jest-environment node
 */

import { isEmpty, isObject, isArray } from '@/lib/util/isEmpty';

describe('isEmpty', () => {
    describe('isObject', () => {
        it('should return true for plain objects', () => {
            expect(isObject({})).toBe(true);
            expect(isObject({ key: 'value' })).toBe(true);
        });

        it('should return true for arrays (arrays are objects)', () => {
            expect(isObject([])).toBe(true);
            expect(isObject([1, 2, 3])).toBe(true);
        });

        it('should return true for Date objects', () => {
            expect(isObject(new Date())).toBe(true);
        });

        it('should return true for RegExp objects', () => {
            expect(isObject(/test/)).toBe(true);
        });

        it('should return false for primitives', () => {
            expect(isObject(null)).toBe(false);
            expect(isObject(undefined)).toBe(false);
            expect(isObject('string')).toBe(false);
            expect(isObject(123)).toBe(false);
            expect(isObject(true)).toBe(false);
        });

        it('should return true for function objects', () => {
            expect(isObject(() => { })).toBe(true);
        });
    });

    describe('isArray', () => {
        it('should return true for arrays', () => {
            expect(isArray([])).toBe(true);
            expect(isArray([1, 2, 3])).toBe(true);
            expect(isArray(new Array(5))).toBe(true);
        });

        it('should return false for non-arrays', () => {
            expect(isArray({})).toBe(false);
            expect(isArray('string')).toBe(false);
            expect(isArray(123)).toBe(false);
            expect(isArray(null)).toBe(false);
            expect(isArray(undefined)).toBe(false);
        });

        it('should return false for array-like objects', () => {
            expect(isArray({ length: 3 })).toBe(false);
            expect(isArray({ 0: 'a', 1: 'b', length: 2 })).toBe(false);
        });
    });

    describe('isEmpty', () => {
        it('should return true for null', () => {
            expect(isEmpty(null)).toBe(true);
        });

        it('should return true for undefined', () => {
            expect(isEmpty(undefined)).toBe(true);
        });

        it('should return true for empty objects', () => {
            expect(isEmpty({})).toBe(true);
        });

        it('should return false for objects with properties', () => {
            expect(isEmpty({ key: 'value' })).toBe(false);
            expect(isEmpty({ a: 1, b: 2 })).toBe(false);
        });

        it('should return true for empty arrays', () => {
            expect(isEmpty([])).toBe(true);
        });

        it('should return false for arrays with elements', () => {
            expect(isEmpty([1])).toBe(false);
            expect(isEmpty([1, 2, 3])).toBe(false);
            expect(isEmpty([null])).toBe(false);
        });

        it('should return true for empty strings', () => {
            expect(isEmpty('')).toBe(true);
        });

        it('should return true for whitespace-only strings', () => {
            expect(isEmpty(' ')).toBe(true);
            expect(isEmpty('   ')).toBe(true);
            expect(isEmpty('\t')).toBe(true);
            expect(isEmpty('\n')).toBe(true);
            expect(isEmpty(' \t\n ')).toBe(true);
        });

        it('should return false for non-empty strings', () => {
            expect(isEmpty('text')).toBe(false);
            expect(isEmpty(' text ')).toBe(false);
            expect(isEmpty('0')).toBe(false);
        });

        it('should return false for numbers', () => {
            expect(isEmpty(0)).toBe(false);
            expect(isEmpty(123)).toBe(false);
            expect(isEmpty(-1)).toBe(false);
            expect(isEmpty(NaN)).toBe(false);
            expect(isEmpty(Infinity)).toBe(false);
        });

        it('should return false for booleans', () => {
            expect(isEmpty(true)).toBe(false);
            expect(isEmpty(false)).toBe(false);
        });

        it('should return true for Date objects (treated as empty objects)', () => {
            // Date objects have no enumerable keys, so Object.keys returns []
            expect(isEmpty(new Date())).toBe(true);
        });

        it('should return true for functions (treated as empty objects)', () => {
            // Functions have no enumerable keys, so Object.keys returns []
            expect(isEmpty(() => { })).toBe(true);
            expect(isEmpty(function () { })).toBe(true);
        });

        it('should handle objects with null/undefined values', () => {
            expect(isEmpty({ key: null })).toBe(false);
            expect(isEmpty({ key: undefined })).toBe(false);
        });

        it('should handle nested empty structures', () => {
            expect(isEmpty({ nested: {} })).toBe(false); // Not empty - has property
            expect(isEmpty([[], []])).toBe(false); // Not empty - has elements
        });

        it('should handle special string cases', () => {
            expect(isEmpty('\r\n')).toBe(true);
            expect(isEmpty('\u00A0')).toBe(true); // Non-breaking space
        });
    });
});
