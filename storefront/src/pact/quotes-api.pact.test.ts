import { pactWith } from 'jest-pact';
import { Matchers } from '@pact-foundation/pact';

/**
 * Pact Consumer Test - Quotes API
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
        describe('Quotes API Contract', () => {
            describe('POST /store/quotes', () => {
                beforeEach(() => {
                    interaction
                        .given('carrinho cart_01JXXX existe')
                        .uponReceiving('uma requisição para criar cotação')
                        .withRequest({
                            method: 'POST',
                            path: '/store/quotes',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                                'Authorization': Matchers.string('Bearer token_xxx'),
                            },
                            body: {
                                cart_id: 'cart_01JXXX',
                                message: Matchers.string('Solicito cotação para este pedido'),
                            },
                        })
                        .willRespondWith({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                quote: {
                                    id: Matchers.string('quote_01JXXX'),
                                    cart_id: 'cart_01JXXX',
                                    customer_id: Matchers.string(),
                                    status: 'pending',
                                    draft_order_id: Matchers.string('dorder_01JXXX'),
                                    created_at: Matchers.iso8601DateTime(),
                                    updated_at: Matchers.iso8601DateTime(),
                                },
                            },
                        });
                });

                it('creates a new quote', async () => {
                    const response = await fetch('http://localhost:8080/store/quotes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-publishable-api-key': 'pk_test_xxx',
                            'Authorization': 'Bearer token_xxx',
                        },
                        body: JSON.stringify({
                            cart_id: 'cart_01JXXX',
                            message: 'Solicito cotação para este pedido',
                        }),
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.quote).toBeDefined();
                    expect(data.quote.id).toBeDefined();
                    expect(data.quote.cart_id).toBe('cart_01JXXX');
                    expect(data.quote.status).toBe('pending');
                    expect(data.quote.draft_order_id).toBeDefined();
                });
            });

            describe('GET /store/quotes/:id', () => {
                beforeEach(() => {
                    interaction
                        .given('quote quote_01JXXX existe')
                        .uponReceiving('uma requisição para obter cotação')
                        .withRequest({
                            method: 'GET',
                            path: '/store/quotes/quote_01JXXX',
                            query: {
                                fields: '*messages,*draft_order,*draft_order.items',
                            },
                            headers: {
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                                'Authorization': Matchers.string('Bearer token_xxx'),
                            },
                        })
                        .willRespondWith({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                quote: {
                                    id: 'quote_01JXXX',
                                    cart_id: Matchers.string('cart_01JXXX'),
                                    customer_id: Matchers.string(),
                                    status: Matchers.string('pending'),
                                    draft_order_id: Matchers.string('dorder_01JXXX'),
                                    messages: Matchers.eachLike({
                                        id: Matchers.string('qmsg_01JXXX'),
                                        author_type: Matchers.string('customer'),
                                        message: Matchers.string(),
                                        created_at: Matchers.iso8601DateTime(),
                                    }),
                                    draft_order: {
                                        id: Matchers.string('dorder_01JXXX'),
                                        total: Matchers.integer(1250000),
                                        currency_code: 'BRL',
                                        items: Matchers.eachLike({
                                            id: Matchers.string(),
                                            title: Matchers.string(),
                                            quantity: Matchers.integer(),
                                            unit_price: Matchers.integer(),
                                        }),
                                    },
                                    created_at: Matchers.iso8601DateTime(),
                                    updated_at: Matchers.iso8601DateTime(),
                                },
                            },
                        });
                });

                it('returns quote with details', async () => {
                    const response = await fetch('http://localhost:8080/store/quotes/quote_01JXXX?fields=*messages,*draft_order,*draft_order.items', {
                        headers: {
                            'x-publishable-api-key': 'pk_test_xxx',
                            'Authorization': 'Bearer token_xxx',
                        },
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.quote).toBeDefined();
                    expect(data.quote.id).toBe('quote_01JXXX');
                    expect(data.quote.messages).toBeDefined();
                    expect(data.quote.draft_order).toBeDefined();
                    expect(data.quote.draft_order.items).toBeDefined();
                });
            });

            describe('GET /store/quotes', () => {
                beforeEach(() => {
                    interaction
                        .given('customer tem cotações')
                        .uponReceiving('uma requisição para listar cotações')
                        .withRequest({
                            method: 'GET',
                            path: '/store/quotes',
                            query: {
                                limit: '20',
                                offset: '0',
                            },
                            headers: {
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                                'Authorization': Matchers.string('Bearer token_xxx'),
                            },
                        })
                        .willRespondWith({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                quotes: Matchers.eachLike({
                                    id: Matchers.string('quote_01JXXX'),
                                    status: Matchers.string('pending'),
                                    draft_order_id: Matchers.string('dorder_01JXXX'),
                                    created_at: Matchers.iso8601DateTime(),
                                    updated_at: Matchers.iso8601DateTime(),
                                }),
                                count: Matchers.integer(5),
                                limit: 20,
                                offset: 0,
                            },
                        });
                });

                it('returns list of quotes', async () => {
                    const response = await fetch('http://localhost:8080/store/quotes?limit=20&offset=0', {
                        headers: {
                            'x-publishable-api-key': 'pk_test_xxx',
                            'Authorization': 'Bearer token_xxx',
                        },
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.quotes).toBeDefined();
                    expect(Array.isArray(data.quotes)).toBe(true);
                    expect(data.count).toBeGreaterThan(0);
                });
            });

            describe('POST /store/quotes/:id/messages', () => {
                beforeEach(() => {
                    interaction
                        .given('quote quote_01JXXX existe')
                        .uponReceiving('uma requisição para enviar mensagem')
                        .withRequest({
                            method: 'POST',
                            path: '/store/quotes/quote_01JXXX/messages',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                                'Authorization': Matchers.string('Bearer token_xxx'),
                            },
                            body: {
                                message: Matchers.string('Gostaria de discutir o preço'),
                            },
                        })
                        .willRespondWith({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                message: {
                                    id: Matchers.string('qmsg_01JXXX'),
                                    quote_id: 'quote_01JXXX',
                                    author_type: 'customer',
                                    message: 'Gostaria de discutir o preço',
                                    created_at: Matchers.iso8601DateTime(),
                                },
                            },
                        });
                });

                it('sends message to quote', async () => {
                    const response = await fetch('http://localhost:8080/store/quotes/quote_01JXXX/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-publishable-api-key': 'pk_test_xxx',
                            'Authorization': 'Bearer token_xxx',
                        },
                        body: JSON.stringify({
                            message: 'Gostaria de discutir o preço',
                        }),
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.message).toBeDefined();
                    expect(data.message.id).toBeDefined();
                    expect(data.message.quote_id).toBe('quote_01JXXX');
                    expect(data.message.author_type).toBe('customer');
                    expect(data.message.message).toBe('Gostaria de discutir o preço');
                });
            });

            describe('POST /store/quotes/:id/accept', () => {
                beforeEach(() => {
                    interaction
                        .given('quote quote_01JXXX foi respondida pelo merchant')
                        .uponReceiving('uma requisição para aceitar cotação')
                        .withRequest({
                            method: 'POST',
                            path: '/store/quotes/quote_01JXXX/accept',
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
                                quote: {
                                    id: 'quote_01JXXX',
                                    status: 'accepted',
                                    order_id: Matchers.string('order_01JXXX'),
                                    updated_at: Matchers.iso8601DateTime(),
                                },
                                order: {
                                    id: Matchers.string('order_01JXXX'),
                                    status: 'pending',
                                    total: Matchers.integer(1250000),
                                    currency_code: 'BRL',
                                    created_at: Matchers.iso8601DateTime(),
                                },
                            },
                        });
                });

                it('accepts quote and creates order', async () => {
                    const response = await fetch('http://localhost:8080/store/quotes/quote_01JXXX/accept', {
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
                    expect(data.quote).toBeDefined();
                    expect(data.quote.status).toBe('accepted');
                    expect(data.quote.order_id).toBeDefined();
                    expect(data.order).toBeDefined();
                    expect(data.order.id).toBeDefined();
                });
            });
        });
    }
);
