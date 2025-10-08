/**
 * @jest-environment node
 */

import { sortProducts } from '@/lib/util/sort-products';
import { HttpTypes } from '@medusajs/types';
import { SortOptions } from '@/modules/store/components/refinement-list/sort-products';

describe('sortProducts', () => {
    const createVariant = (price: number): HttpTypes.StoreProductVariant => ({
        id: `variant-${price}`,
        calculated_price: {
            calculated_amount: price,
        } as any,
    } as HttpTypes.StoreProductVariant);

    const createProduct = (
        id: string,
        title: string,
        prices: number[],
        createdAt?: string
    ): HttpTypes.StoreProduct => ({
        id,
        title,
        variants: prices.map(createVariant),
        created_at: createdAt || '2024-01-01T00:00:00.000Z',
    } as HttpTypes.StoreProduct);

    describe('price_asc sorting', () => {
        it('should sort products by minimum price in ascending order', () => {
            const products = [
                createProduct('prod-1', 'Expensive', [1000, 1200]),
                createProduct('prod-2', 'Cheap', [100, 200]),
                createProduct('prod-3', 'Medium', [500, 600]),
            ];

            const sorted = sortProducts(products, 'price_asc');

            expect(sorted[0].id).toBe('prod-2'); // Min price: 100
            expect(sorted[1].id).toBe('prod-3'); // Min price: 500
            expect(sorted[2].id).toBe('prod-1'); // Min price: 1000
        });

        it('should use the minimum variant price for sorting', () => {
            const products = [
                createProduct('prod-1', 'Product 1', [1000, 500, 1500]), // Min: 500
                createProduct('prod-2', 'Product 2', [800, 700, 900]), // Min: 700
                createProduct('prod-3', 'Product 3', [200, 1000, 300]), // Min: 200
            ];

            const sorted = sortProducts(products, 'price_asc');

            expect(sorted[0].id).toBe('prod-3'); // Min: 200
            expect(sorted[1].id).toBe('prod-1'); // Min: 500
            expect(sorted[2].id).toBe('prod-2'); // Min: 700
        });

        it('should handle products with single variant', () => {
            const products = [
                createProduct('prod-1', 'Product 1', [500]),
                createProduct('prod-2', 'Product 2', [200]),
                createProduct('prod-3', 'Product 3', [800]),
            ];

            const sorted = sortProducts(products, 'price_asc');

            expect(sorted[0].id).toBe('prod-2');
            expect(sorted[1].id).toBe('prod-1');
            expect(sorted[2].id).toBe('prod-3');
        });

        it('should place products without variants at the end', () => {
            const products = [
                createProduct('prod-1', 'With Variants', [500]),
                { id: 'prod-2', title: 'No Variants', variants: [] } as HttpTypes.StoreProduct,
                createProduct('prod-3', 'With Variants 2', [200]),
            ];

            const sorted = sortProducts(products, 'price_asc');

            expect(sorted[0].id).toBe('prod-3');
            expect(sorted[1].id).toBe('prod-1');
            expect(sorted[2].id).toBe('prod-2'); // No variants = Infinity price
        });
    });

    describe('price_desc sorting', () => {
        it('should sort products by minimum price in descending order', () => {
            const products = [
                createProduct('prod-1', 'Cheap', [100, 200]),
                createProduct('prod-2', 'Expensive', [1000, 1200]),
                createProduct('prod-3', 'Medium', [500, 600]),
            ];

            const sorted = sortProducts(products, 'price_desc');

            expect(sorted[0].id).toBe('prod-2'); // Min price: 1000
            expect(sorted[1].id).toBe('prod-3'); // Min price: 500
            expect(sorted[2].id).toBe('prod-1'); // Min price: 100
        });

        it('should handle equal minimum prices (stable sort)', () => {
            const products = [
                createProduct('prod-1', 'Product 1', [500, 600]),
                createProduct('prod-2', 'Product 2', [500, 700]),
                createProduct('prod-3', 'Product 3', [400, 800]),
            ];

            const sorted = sortProducts(products, 'price_desc');

            expect(sorted[0].id).toBe('prod-1'); // Min: 500 (or prod-2, both equal)
            expect(sorted[2].id).toBe('prod-3'); // Min: 400
        });
    });

    describe('created_at sorting', () => {
        it('should sort products by creation date (newest first)', () => {
            const products = [
                createProduct('prod-1', 'Old', [100], '2024-01-01T00:00:00.000Z'),
                createProduct('prod-2', 'Recent', [100], '2024-03-01T00:00:00.000Z'),
                createProduct('prod-3', 'Newest', [100], '2024-05-01T00:00:00.000Z'),
            ];

            const sorted = sortProducts(products, 'created_at');

            expect(sorted[0].id).toBe('prod-3'); // Newest: 2024-05-01
            expect(sorted[1].id).toBe('prod-2'); // Recent: 2024-03-01
            expect(sorted[2].id).toBe('prod-1'); // Old: 2024-01-01
        });

        it('should handle same creation dates', () => {
            const products = [
                createProduct('prod-1', 'Product 1', [100], '2024-01-01T10:00:00.000Z'),
                createProduct('prod-2', 'Product 2', [100], '2024-01-01T10:00:00.000Z'),
                createProduct('prod-3', 'Product 3', [100], '2024-01-01T09:00:00.000Z'),
            ];

            const sorted = sortProducts(products, 'created_at');

            // prod-1 and prod-2 have same timestamp, prod-3 is older
            expect(sorted[2].id).toBe('prod-3');
        });

        it('should not affect variant prices when sorting by date', () => {
            const products = [
                createProduct('prod-1', 'Expensive Old', [1000], '2024-01-01T00:00:00.000Z'),
                createProduct('prod-2', 'Cheap New', [100], '2024-05-01T00:00:00.000Z'),
            ];

            const sorted = sortProducts(products, 'created_at');

            expect(sorted[0].id).toBe('prod-2'); // Newest, even though cheaper
            expect(sorted[1].id).toBe('prod-1');
        });
    });

    describe('edge cases', () => {
        it('should handle empty products array', () => {
            const products: HttpTypes.StoreProduct[] = [];
            const sorted = sortProducts(products, 'price_asc');

            expect(sorted).toEqual([]);
        });

        it('should handle single product', () => {
            const products = [createProduct('prod-1', 'Only Product', [500])];
            const sorted = sortProducts(products, 'price_asc');

            expect(sorted).toHaveLength(1);
            expect(sorted[0].id).toBe('prod-1');
        });

        it('should handle variants with 0 price', () => {
            const products = [
                createProduct('prod-1', 'Free Product', [0]),
                createProduct('prod-2', 'Paid Product', [100]),
            ];

            const sorted = sortProducts(products, 'price_asc');

            expect(sorted[0].id).toBe('prod-1'); // Price 0 comes first
            expect(sorted[1].id).toBe('prod-2');
        });

        it('should handle variants with undefined calculated_price', () => {
            const products = [
                {
                    id: 'prod-1',
                    title: 'Product 1',
                    variants: [{ id: 'var-1', calculated_price: undefined }],
                    created_at: '2024-01-01T00:00:00.000Z',
                } as HttpTypes.StoreProduct,
                createProduct('prod-2', 'Product 2', [500]),
            ];

            const sorted = sortProducts(products, 'price_asc');

            // Product with undefined price should use 0
            expect(sorted[0].id).toBe('prod-1');
            expect(sorted[1].id).toBe('prod-2');
        });

        it('should not mutate original array when sorting by price', () => {
            const products = [
                createProduct('prod-1', 'B', [1000]),
                createProduct('prod-2', 'A', [100]),
            ];

            const originalOrder = products.map((p) => p.id);
            sortProducts(products, 'price_asc');

            // Original array order should be unchanged
            expect(products.map((p) => p.id)).toEqual(originalOrder);
        });

        it('should handle very large price differences', () => {
            const products = [
                createProduct('prod-1', 'Normal', [100]),
                createProduct('prod-2', 'Expensive', [999999999]),
                createProduct('prod-3', 'Cheap', [1]),
            ];

            const sorted = sortProducts(products, 'price_asc');

            expect(sorted[0].id).toBe('prod-3');
            expect(sorted[1].id).toBe('prod-1');
            expect(sorted[2].id).toBe('prod-2');
        });

        it('should return products as-is for unrecognized sort option', () => {
            const products = [
                createProduct('prod-1', 'B', [1000]),
                createProduct('prod-2', 'A', [100]),
            ];

            const sorted = sortProducts(products, 'unknown' as SortOptions);

            // Should return in original order
            expect(sorted[0].id).toBe('prod-1');
            expect(sorted[1].id).toBe('prod-2');
        });
    });
});
