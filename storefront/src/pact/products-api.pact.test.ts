import { pactWith } from 'jest-pact';
import { Matchers } from '@pact-foundation/pact';

/**
 * Pact Consumer Test - Products API
 * Tests contract between Storefront (consumer) and Backend (provider)
 */

pactWith(
    {
        consumer: 'ysh-storefront',
        provider: 'ysh-backend',
        port: 8080,
        pactfileWriteMode: 'update',
        dir: './pacts',
    },
    (provider) => {
        describe('Products API Contract', () => {
            describe('GET /store/products', () => {
                beforeEach(async () => {
                    const productMatcher = {
                        id: Matchers.string('prod_01JXXX'),
                        title: Matchers.string('Painel Solar 550W'),
                        handle: Matchers.string('painel-solar-550w'),
                        thumbnail: Matchers.string('/uploads/thumbnail.jpg'),
                        status: Matchers.string('published'),
                        variants: Matchers.eachLike({
                            id: Matchers.string('variant_01JXXX'),
                            title: Matchers.string('Default'),
                            sku: Matchers.string('PSL-550W-01'),
                            calculated_price: Matchers.like({
                                calculated_amount: Matchers.integer(250000),
                                currency_code: Matchers.string('BRL'),
                            }),
                        }),
                    };

                    await provider.addInteraction({
                        state: 'produtos existem no catálogo',
                        uponReceiving: 'uma requisição para listar produtos',
                        withRequest: {
                            method: 'GET',
                            path: '/store/products',
                            query: {
                                fields: '*variants,*variants.calculated_price',
                                limit: '20',
                                offset: '0',
                            },
                            headers: {
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                            },
                        },
                        willRespondWith: {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                products: Matchers.eachLike(productMatcher),
                                count: Matchers.integer(45),
                                limit: 20,
                                offset: 0,
                            },
                        },
                    });
                });

                it('returns a paginated list of products', async () => {
                    // Arrange
                    const response = await fetch('http://localhost:8080/store/products?fields=*variants,*variants.calculated_price&limit=20&offset=0', {
                        headers: {
                            'x-publishable-api-key': 'pk_test_xxx',
                        },
                    });

                    // Assert
                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.products).toBeDefined();
                    expect(Array.isArray(data.products)).toBe(true);
                    expect(data.products.length).toBeGreaterThan(0);
                    expect(data.count).toBeGreaterThan(0);
                    expect(data.limit).toBe(20);
                    expect(data.offset).toBe(0);

                    // Verify product structure
                    const product = data.products[0];
                    expect(product).toHaveProperty('id');
                    expect(product).toHaveProperty('title');
                    expect(product).toHaveProperty('handle');
                    expect(product).toHaveProperty('thumbnail');
                    expect(product).toHaveProperty('status');
                    expect(product).toHaveProperty('variants');
                    expect(Array.isArray(product.variants)).toBe(true);

                    // Verify variant structure
                    if (product.variants.length > 0) {
                        const variant = product.variants[0];
                        expect(variant).toHaveProperty('id');
                        expect(variant).toHaveProperty('sku');
                        expect(variant).toHaveProperty('calculated_price');
                        expect(variant.calculated_price).toHaveProperty('calculated_amount');
                        expect(variant.calculated_price).toHaveProperty('currency_code');
                    }
                });
            });

            describe('GET /store/products/:id', () => {
                beforeEach(async () => {
                    await provider.addInteraction({
                        state: 'produto prod_01JXXX existe',
                        uponReceiving: 'uma requisição para obter produto por ID',
                        withRequest: {
                            method: 'GET',
                            path: '/store/products/prod_01JXXX',
                            query: {
                                fields: '*variants,*variants.calculated_price,*images',
                            },
                            headers: {
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                            },
                        },
                        willRespondWith: {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                product: {
                                    id: 'prod_01JXXX',
                                    title: 'Painel Solar 550W',
                                    handle: 'painel-solar-550w',
                                    description: Matchers.string('Painel solar de alta eficiência'),
                                    thumbnail: Matchers.string('/uploads/thumbnail.jpg'),
                                    images: Matchers.eachLike({
                                        id: Matchers.string('img_01JXXX'),
                                        url: Matchers.string('/uploads/image.jpg'),
                                    }),
                                    variants: Matchers.eachLike({
                                        id: Matchers.string('variant_01JXXX'),
                                        title: 'Default',
                                        sku: 'PSL-550W-01',
                                        calculated_price: {
                                            calculated_amount: 250000,
                                            currency_code: 'BRL',
                                        },
                                    }),
                                },
                            },
                        },
                    });
                });

                it('returns a single product with full details', async () => {
                    // Arrange
                    const response = await fetch('http://localhost:8080/store/products/prod_01JXXX?fields=*variants,*variants.calculated_price,*images', {
                        headers: {
                            'x-publishable-api-key': 'pk_test_xxx',
                        },
                    });

                    // Assert
                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.product).toBeDefined();

                    const product = data.product;
                    expect(product.id).toBe('prod_01JXXX');
                    expect(product.title).toBe('Painel Solar 550W');
                    expect(product.handle).toBe('painel-solar-550w');
                    expect(product.description).toBeDefined();
                    expect(product.thumbnail).toBeDefined();
                    expect(product.images).toBeDefined();
                    expect(Array.isArray(product.images)).toBe(true);
                    expect(product.variants).toBeDefined();
                    expect(Array.isArray(product.variants)).toBe(true);
                });
            });

            describe('GET /store/products/:id - Not Found', () => {
                beforeEach(async () => {
                    await provider.addInteraction({
                        state: 'produto não existe',
                        uponReceiving: 'uma requisição para produto inexistente',
                        withRequest: {
                            method: 'GET',
                            path: '/store/products/prod_NOTFOUND',
                            headers: {
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                            },
                        },
                        willRespondWith: {
                            status: 404,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                message: Matchers.string('Product not found'),
                                type: 'not_found',
                            },
                        },
                    });
                });

                it('returns 404 for non-existent product', async () => {
                    // Arrange
                    const response = await fetch('http://localhost:8080/store/products/prod_NOTFOUND', {
                        headers: {
                            'x-publishable-api-key': 'pk_test_xxx',
                        },
                    });

                    // Assert
                    expect(response.status).toBe(404);
                    const data = await response.json();
                    expect(data.message).toBeDefined();
                    expect(data.type).toBe('not_found');
                });
            });
        });
    }
);
