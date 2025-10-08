/**
 * @jest-environment node
 */

import { cartToCsv } from '@/lib/util/convert-cart-to-csv';
import { B2BCart } from '@/types/global';
import { HttpTypes } from '@medusajs/types';

describe('cartToCsv', () => {
    const createCartItem = (overrides = {}): HttpTypes.StoreCartLineItem => ({
        id: 'item-1',
        variant_id: 'variant-1',
        product_id: 'prod-1',
        product_title: 'Painel Solar 550W',
        product_description: 'Painel solar de alta eficiência',
        variant_sku: 'PANEL-550W',
        variant_title: '550W Monocristalino',
        quantity: 10,
        unit_price: 850.0,
        tax_lines: [{ rate: 0.18, name: 'ICMS', code: 'ICMS' }],
        ...overrides,
    } as HttpTypes.StoreCartLineItem);

    const createCart = (items: HttpTypes.StoreCartLineItem[]): B2BCart =>
    ({
        id: 'cart-1',
        items,
    } as B2BCart);

    it('should convert cart with single item to CSV', () => {
        const cart = createCart([createCartItem()]);
        const csv = cartToCsv(cart);

        expect(csv).toContain('ID do Item,ID da Variante,Título do Produto');
        expect(csv).toContain('item-1');
        expect(csv).toContain('variant-1');
        expect(csv).toContain('"Painel Solar 550W"');
        expect(csv).toContain('PANEL-550W');
        expect(csv).toContain('10');
        expect(csv).toContain('850.00');
    });

    it('should calculate total price correctly', () => {
        const cart = createCart([createCartItem({ quantity: 5, unit_price: 100.0 })]);
        const csv = cartToCsv(cart);

        // Total price = 5 * 100 = 500.00
        expect(csv).toContain('500.00');
    });

    it('should calculate tax correctly', () => {
        const cart = createCart([
            createCartItem({
                quantity: 10,
                unit_price: 100.0,
                tax_lines: [{ rate: 0.2, name: 'IVA', code: 'IVA' }],
            }),
        ]);
        const csv = cartToCsv(cart);

        // Total price = 10 * 100 = 1000
        // Tax = 1000 * 0.2 = 200.00
        expect(csv).toContain('0.20'); // Tax rate
        expect(csv).toContain('200.00'); // Total tax
    });

    it('should handle item without tax_lines', () => {
        const cart = createCart([
            createCartItem({
                tax_lines: undefined,
            }),
        ]);
        const csv = cartToCsv(cart);

        expect(csv).toContain('0.00'); // Tax rate defaults to 0
    });

    it('should handle empty tax_lines array', () => {
        const cart = createCart([
            createCartItem({
                tax_lines: [],
            }),
        ]);
        const csv = cartToCsv(cart);

        expect(csv).toContain('0.00'); // Tax rate defaults to 0
    });

    it('should replace newlines in product description', () => {
        const cart = createCart([
            createCartItem({
                product_description: 'Linha 1\nLinha 2\nLinha 3',
            }),
        ]);
        const csv = cartToCsv(cart);

        expect(csv).toContain('Linha 1 Linha 2 Linha 3');
        expect(csv).not.toContain('\n"Linha 1\nLinha 2');
    });

    it('should handle missing variant_sku', () => {
        const cart = createCart([
            createCartItem({
                variant_sku: null,
            }),
        ]);
        const csv = cartToCsv(cart);

        const lines = csv.split('\n');
        expect(lines[1]).toContain(',,'); // Empty SKU field
    });

    it('should wrap text fields in quotes for CSV safety', () => {
        const cart = createCart([
            createCartItem({
                product_title: 'Produto, com vírgula',
                product_description: 'Descrição "com aspas"',
                variant_title: 'Variante, especial',
            }),
        ]);
        const csv = cartToCsv(cart);

        expect(csv).toContain('"Produto, com vírgula"');
        expect(csv).toContain('"Descrição "com aspas""');
        expect(csv).toContain('"Variante, especial"');
    });

    it('should handle multiple cart items', () => {
        const cart = createCart([
            createCartItem({ id: 'item-1', product_title: 'Produto 1' }),
            createCartItem({ id: 'item-2', product_title: 'Produto 2' }),
            createCartItem({ id: 'item-3', product_title: 'Produto 3' }),
        ]);
        const csv = cartToCsv(cart);

        const lines = csv.split('\n');
        expect(lines).toHaveLength(4); // 1 header + 3 items

        expect(csv).toContain('item-1');
        expect(csv).toContain('item-2');
        expect(csv).toContain('item-3');
    });

    it('should format prices to 2 decimal places', () => {
        const cart = createCart([
            createCartItem({
                quantity: 3,
                unit_price: 99.999,
            }),
        ]);
        const csv = cartToCsv(cart);

        expect(csv).toContain('100.00'); // unit_price formatted
        expect(csv).toContain('300.00'); // total_price formatted (3 * 99.999 = 299.997)
    });

    it('should handle cart with no items', () => {
        const cart = createCart([]);
        const csv = cartToCsv(cart);

        const lines = csv.split('\n');
        expect(lines).toHaveLength(1); // Only header
        expect(csv).toContain('ID do Item,ID da Variante');
    });

    it('should handle undefined items array', () => {
        const cart = { id: 'cart-1', items: undefined } as B2BCart;
        const csv = cartToCsv(cart);

        const lines = csv.split('\n');
        expect(lines).toHaveLength(1); // Only header
    });

    it('should include all expected CSV columns', () => {
        const cart = createCart([createCartItem()]);
        const csv = cartToCsv(cart);

        const header = csv.split('\n')[0];
        expect(header).toBe(
            'ID do Item,ID da Variante,Título do Produto,Descrição do Produto,SKU da Variante,Título da Variante,Quantidade,Preço Unitário,Taxa de Imposto,Preço Total,Imposto Total'
        );
    });

    it('should handle complex tax rate with many decimals', () => {
        const cart = createCart([
            createCartItem({
                quantity: 7,
                unit_price: 123.45,
                tax_lines: [{ rate: 0.175555, name: 'Tax', code: 'TAX' }],
            }),
        ]);
        const csv = cartToCsv(cart);

        // Total price = 7 * 123.45 = 864.15
        // Tax = 864.15 * 0.175555 = 151.74...
        expect(csv).toContain('0.18'); // Rate formatted to 2 decimals
        expect(csv).toContain('151.74'); // Tax formatted to 2 decimals
    });

    it('should handle zero quantity item', () => {
        const cart = createCart([
            createCartItem({
                quantity: 0,
                unit_price: 100.0,
            }),
        ]);
        const csv = cartToCsv(cart);

        expect(csv).toContain(',0,'); // Zero quantity
        expect(csv).toContain('0.00'); // Zero total price
    });

    it('should handle zero unit price', () => {
        const cart = createCart([
            createCartItem({
                quantity: 5,
                unit_price: 0,
            }),
        ]);
        const csv = cartToCsv(cart);

        expect(csv).toContain('0.00'); // Zero unit price
        expect(csv).toContain('0.00'); // Zero total
    });

    it('should maintain CSV structure with missing descriptions', () => {
        const cart = createCart([
            createCartItem({
                product_description: null,
            }),
        ]);
        const csv = cartToCsv(cart);

        const lines = csv.split('\n');
        const dataLine = lines[1];
        const fields = dataLine.split(',');

        // Should have all 11 fields even with null description
        expect(fields.length).toBeGreaterThanOrEqual(11);
    });
});
