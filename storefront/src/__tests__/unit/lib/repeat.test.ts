/**
 * @jest-environment node
 */

import repeat from '@/lib/util/repeat';

describe('repeat', () => {
    it('should return array with correct length', () => {
        const result = repeat(5);
        expect(result).toHaveLength(5);
    });

    it('should return array of sequential numbers starting from 0', () => {
        const result = repeat(5);
        expect(result).toEqual([0, 1, 2, 3, 4]);
    });

    it('should return empty array for 0', () => {
        const result = repeat(0);
        expect(result).toEqual([]);
    });

    it('should handle single iteration', () => {
        const result = repeat(1);
        expect(result).toEqual([0]);
    });

    it('should handle large numbers', () => {
        const result = repeat(100);
        expect(result).toHaveLength(100);
        expect(result[0]).toBe(0);
        expect(result[99]).toBe(99);
    });

    it('should be usable in loops', () => {
        let sum = 0;
        repeat(5).forEach((i) => {
            sum += i;
        });
        expect(sum).toBe(10); // 0 + 1 + 2 + 3 + 4
    });

    it('should be usable with map', () => {
        const result = repeat(3).map((i) => i * 2);
        expect(result).toEqual([0, 2, 4]);
    });

    it('should create new array each time', () => {
        const result1 = repeat(3);
        const result2 = repeat(3);

        expect(result1).not.toBe(result2); // Different references
        expect(result1).toEqual(result2); // Same values
    });

    it('should throw error for negative numbers', () => {
        // Array constructor throws RangeError for negative values
        expect(() => repeat(-5)).toThrow(RangeError);
    }); it('should work with Array methods', () => {
        const result = repeat(4)
            .filter((i) => i % 2 === 0)
            .map((i) => i * 10);

        expect(result).toEqual([0, 20]);
    });

    it('should be useful for generating sequences', () => {
        const letters = repeat(3).map((i) => String.fromCharCode(65 + i));
        expect(letters).toEqual(['A', 'B', 'C']);
    });

    it('should throw error for decimal numbers', () => {
        // Array constructor throws for non-integer lengths
        expect(() => repeat(3.7)).toThrow(RangeError);
    });
});
