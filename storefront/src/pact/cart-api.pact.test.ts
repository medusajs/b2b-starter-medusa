import { pactWith } from 'jest-pact';
import { Matchers } from '@pact-foundation/pact';

/**
 * Pact Consumer Test - Cart API
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
    (interaction) => {
        describe('Cart API Contract', () => {
            describe('POST /store/carts', () => {
                beforeEach(() => {
                    interaction
                        .given('region BR existe')
                        .uponReceiving('uma requisição para criar carrinho')
                        .withRequest({
                            method: 'POST',
                            path: '/store/carts',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                            },
                            body: {
                                region_id: 'reg_01JXXX',
                            },
                        })
                        .willRespondWith({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                cart: {
                                    id: Matchers.string('cart_01JXXX'),
                                    region_id: 'reg_01JXXX',
                                    customer_id: Matchers.string(),
                                    email: Matchers.string(),
                                    currency_code: 'BRL',
                                    items: [],
                                    subtotal: 0,
                                    total: 0,
                                    created_at: Matchers.iso8601DateTime(),
                                    updated_at: Matchers.iso8601DateTime(),
                                },
                            },
                        });
                });

                it('creates a new cart', async () => {
                    const response = await fetch('http://localhost:8080/store/carts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-publishable-api-key': 'pk_test_xxx',
                        },
                        body: JSON.stringify({
                            region_id: 'reg_01JXXX',
                        }),
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.cart).toBeDefined();
                    expect(data.cart.id).toBeDefined();
                    expect(data.cart.region_id).toBe('reg_01JXXX');
                    expect(data.cart.currency_code).toBe('BRL');
                    expect(data.cart.items).toEqual([]);
                    expect(data.cart.subtotal).toBe(0);
                    expect(data.cart.total).toBe(0);
                });
            });

            describe('POST /store/carts/:id/line-items', () => {
                beforeEach(() => {
                    interaction
                        .given('carrinho cart_01JXXX existe e produto variant_01JXXX está disponível')
                        .uponReceiving('uma requisição para adicionar item ao carrinho')
                        .withRequest({
                            method: 'POST',
                            path: '/store/carts/cart_01JXXX/line-items',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                            },
                            body: {
                                variant_id: 'variant_01JXXX',
                                quantity: 5,
                            },
                        })
                        .willRespondWith({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                cart: {
                                    id: 'cart_01JXXX',
                                    items: Matchers.eachLike({
                                        id: Matchers.string('item_01JXXX'),
                                        variant_id: 'variant_01JXXX',
                                        quantity: 5,
                                        title: Matchers.string('Painel Solar 550W'),
                                        unit_price: 250000,
                                        subtotal: 1250000,
                                        total: 1250000,
                                    }),
                                    subtotal: Matchers.integer(1250000),
                                    total: Matchers.integer(1250000),
                                },
                            },
                        });
                });

                it('adds item to cart', async () => {
                    const response = await fetch('http://localhost:8080/store/carts/cart_01JXXX/line-items', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-publishable-api-key': 'pk_test_xxx',
                        },
                        body: JSON.stringify({
                            variant_id: 'variant_01JXXX',
                            quantity: 5,
                        }),
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.cart).toBeDefined();
                    expect(data.cart.items).toBeDefined();
                    expect(data.cart.items.length).toBeGreaterThan(0);

                    const item = data.cart.items[0];
                    expect(item.variant_id).toBe('variant_01JXXX');
                    expect(item.quantity).toBe(5);
                    expect(item.unit_price).toBeDefined();
                    expect(item.subtotal).toBeDefined();
                    expect(data.cart.subtotal).toBeGreaterThan(0);
                    expect(data.cart.total).toBeGreaterThan(0);
                });
            });

            describe('PATCH /store/carts/:id/line-items/:line_id', () => {
                beforeEach(() => {
                    interaction
                        .given('carrinho cart_01JXXX tem item item_01JXXX')
                        .uponReceiving('uma requisição para atualizar quantidade do item')
                        .withRequest({
                            method: 'PATCH',
                            path: '/store/carts/cart_01JXXX/line-items/item_01JXXX',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                            },
                            body: {
                                quantity: 10,
                            },
                        })
                        .willRespondWith({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                cart: {
                                    id: 'cart_01JXXX',
                                    items: Matchers.eachLike({
                                        id: 'item_01JXXX',
                                        quantity: 10,
                                        subtotal: Matchers.integer(2500000),
                                    }),
                                    subtotal: Matchers.integer(2500000),
                                    total: Matchers.integer(2500000),
                                },
                            },
                        });
                });

                it('updates item quantity', async () => {
                    const response = await fetch('http://localhost:8080/store/carts/cart_01JXXX/line-items/item_01JXXX', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-publishable-api-key': 'pk_test_xxx',
                        },
                        body: JSON.stringify({
                            quantity: 10,
                        }),
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.cart).toBeDefined();
                    expect(data.cart.items[0].quantity).toBe(10);
                    expect(data.cart.subtotal).toBeGreaterThan(0);
                });
            });

            describe('DELETE /store/carts/:id/line-items/:line_id', () => {
                beforeEach(() => {
                    interaction
                        .given('carrinho cart_01JXXX tem item item_01JXXX')
                        .uponReceiving('uma requisição para remover item do carrinho')
                        .withRequest({
                            method: 'DELETE',
                            path: '/store/carts/cart_01JXXX/line-items/item_01JXXX',
                            headers: {
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                            },
                        })
                        .willRespondWith({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                cart: {
                                    id: 'cart_01JXXX',
                                    items: [],
                                    subtotal: 0,
                                    total: 0,
                                },
                            },
                        });
                });

                it('removes item from cart', async () => {
                    const response = await fetch('http://localhost:8080/store/carts/cart_01JXXX/line-items/item_01JXXX', {
                        method: 'DELETE',
                        headers: {
                            'x-publishable-api-key': 'pk_test_xxx',
                        },
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.cart).toBeDefined();
                    expect(data.cart.items).toEqual([]);
                    expect(data.cart.subtotal).toBe(0);
                    expect(data.cart.total).toBe(0);
                });
            });

            describe('POST /store/carts/:id/complete', () => {
                beforeEach(() => {
                    interaction
                        .given('carrinho cart_01JXXX está pronto para checkout e aprovado')
                        .uponReceiving('uma requisição para completar checkout')
                        .withRequest({
                            method: 'POST',
                            path: '/store/carts/cart_01JXXX/complete',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                                'Authorization': Matchers.string('Bearer token_xxx'),
                            },
                            body: {},
                        })
                        .willRespondWith({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                type: 'order',
                                order: {
                                    id: Matchers.string('order_01JXXX'),
                                    cart_id: 'cart_01JXXX',
                                    customer_id: Matchers.string(),
                                    email: Matchers.string(),
                                    status: 'pending',
                                    total: Matchers.integer(1250000),
                                    currency_code: 'BRL',
                                    items: Matchers.eachLike({
                                        id: Matchers.string(),
                                        title: Matchers.string(),
                                        quantity: Matchers.integer(),
                                        unit_price: Matchers.integer(),
                                    }),
                                    created_at: Matchers.iso8601DateTime(),
                                },
                            },
                        });
                });

                it('completes checkout and creates order', async () => {
                    const response = await fetch('http://localhost:8080/store/carts/cart_01JXXX/complete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-publishable-api-key': 'pk_test_xxx',
                            'Authorization': 'Bearer token_xxx',
                        },
                        body: JSON.stringify({}),
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.type).toBe('order');
                    expect(data.order).toBeDefined();
                    expect(data.order.id).toBeDefined();
                    expect(data.order.cart_id).toBe('cart_01JXXX');
                    expect(data.order.status).toBe('pending');
                    expect(data.order.total).toBeGreaterThan(0);
                    expect(data.order.items).toBeDefined();
                });
            });
        });
    }
);
