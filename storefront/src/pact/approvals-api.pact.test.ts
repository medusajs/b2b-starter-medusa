import { pactWith } from 'jest-pact';
import { Matchers } from '@pact-foundation/pact';

/**
 * Pact Consumer Test - Approvals API
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
        describe('Approvals API Contract', () => {
            describe('GET /store/approvals', () => {
                beforeEach(() => {
                    interaction
                        .given('employee tem aprovações pendentes')
                        .uponReceiving('uma requisição para listar aprovações')
                        .withRequest({
                            method: 'GET',
                            path: '/store/approvals',
                            query: {
                                fields: '*cart,*cart.items',
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
                                approvals: Matchers.eachLike({
                                    id: Matchers.string('appr_01JXXX'),
                                    cart_id: Matchers.string('cart_01JXXX'),
                                    status: Matchers.string('pending'),
                                    required_approvers: Matchers.integer(1),
                                    current_approvers: Matchers.integer(0),
                                    cart: {
                                        id: Matchers.string('cart_01JXXX'),
                                        total: Matchers.integer(1250000),
                                        currency_code: 'BRL',
                                        items: Matchers.eachLike({
                                            id: Matchers.string(),
                                            title: Matchers.string(),
                                            quantity: Matchers.integer(),
                                        }),
                                    },
                                    created_at: Matchers.iso8601DateTime(),
                                    updated_at: Matchers.iso8601DateTime(),
                                }),
                                count: Matchers.integer(3),
                                limit: 20,
                                offset: 0,
                            },
                        });
                });

                it('returns list of approvals', async () => {
                    const response = await fetch('http://localhost:8080/store/approvals?fields=*cart,*cart.items&limit=20&offset=0', {
                        headers: {
                            'x-publishable-api-key': 'pk_test_xxx',
                            'Authorization': 'Bearer token_xxx',
                        },
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.approvals).toBeDefined();
                    expect(Array.isArray(data.approvals)).toBe(true);
                    expect(data.count).toBeGreaterThan(0);

                    const approval = data.approvals[0];
                    expect(approval).toHaveProperty('id');
                    expect(approval).toHaveProperty('cart_id');
                    expect(approval).toHaveProperty('status');
                    expect(approval).toHaveProperty('required_approvers');
                    expect(approval).toHaveProperty('current_approvers');
                    expect(approval).toHaveProperty('cart');
                    expect(approval.cart).toHaveProperty('items');
                });
            });

            describe('POST /store/approvals/:id/approve', () => {
                beforeEach(() => {
                    interaction
                        .given('approval appr_01JXXX está pendente e employee é aprovador')
                        .uponReceiving('uma requisição para aprovar')
                        .withRequest({
                            method: 'POST',
                            path: '/store/approvals/appr_01JXXX/approve',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                                'Authorization': Matchers.string('Bearer token_xxx'),
                            },
                            body: {
                                comment: Matchers.string('Aprovado conforme política'),
                            },
                        })
                        .willRespondWith({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                approval: {
                                    id: 'appr_01JXXX',
                                    status: 'approved',
                                    current_approvers: 1,
                                    approvals: Matchers.eachLike({
                                        employee_id: Matchers.string(),
                                        status: 'approved',
                                        comment: 'Aprovado conforme política',
                                        created_at: Matchers.iso8601DateTime(),
                                    }),
                                    updated_at: Matchers.iso8601DateTime(),
                                },
                            },
                        });
                });

                it('approves the request', async () => {
                    const response = await fetch('http://localhost:8080/store/approvals/appr_01JXXX/approve', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-publishable-api-key': 'pk_test_xxx',
                            'Authorization': 'Bearer token_xxx',
                        },
                        body: JSON.stringify({
                            comment: 'Aprovado conforme política',
                        }),
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.approval).toBeDefined();
                    expect(data.approval.id).toBe('appr_01JXXX');
                    expect(data.approval.status).toBe('approved');
                    expect(data.approval.current_approvers).toBe(1);
                    expect(data.approval.approvals).toBeDefined();
                });
            });

            describe('POST /store/approvals/:id/reject', () => {
                beforeEach(() => {
                    interaction
                        .given('approval appr_01JXXX está pendente e employee é aprovador')
                        .uponReceiving('uma requisição para rejeitar')
                        .withRequest({
                            method: 'POST',
                            path: '/store/approvals/appr_01JXXX/reject',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
                                'Authorization': Matchers.string('Bearer token_xxx'),
                            },
                            body: {
                                comment: Matchers.string('Valor acima do orçamento'),
                            },
                        })
                        .willRespondWith({
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: {
                                approval: {
                                    id: 'appr_01JXXX',
                                    status: 'rejected',
                                    approvals: Matchers.eachLike({
                                        employee_id: Matchers.string(),
                                        status: 'rejected',
                                        comment: 'Valor acima do orçamento',
                                        created_at: Matchers.iso8601DateTime(),
                                    }),
                                    updated_at: Matchers.iso8601DateTime(),
                                },
                            },
                        });
                });

                it('rejects the request', async () => {
                    const response = await fetch('http://localhost:8080/store/approvals/appr_01JXXX/reject', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-publishable-api-key': 'pk_test_xxx',
                            'Authorization': 'Bearer token_xxx',
                        },
                        body: JSON.stringify({
                            comment: 'Valor acima do orçamento',
                        }),
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.approval).toBeDefined();
                    expect(data.approval.id).toBe('appr_01JXXX');
                    expect(data.approval.status).toBe('rejected');
                    expect(data.approval.approvals).toBeDefined();
                });
            });

            describe('GET /store/approvals/:id', () => {
                beforeEach(() => {
                    interaction
                        .given('approval appr_01JXXX existe')
                        .uponReceiving('uma requisição para obter detalhes da aprovação')
                        .withRequest({
                            method: 'GET',
                            path: '/store/approvals/appr_01JXXX',
                            query: {
                                fields: '*cart,*cart.items,*approvals',
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
                                approval: {
                                    id: 'appr_01JXXX',
                                    cart_id: Matchers.string('cart_01JXXX'),
                                    status: Matchers.string('pending'),
                                    required_approvers: 2,
                                    current_approvers: 0,
                                    cart: {
                                        id: Matchers.string('cart_01JXXX'),
                                        total: Matchers.integer(1250000),
                                        items: Matchers.eachLike({
                                            id: Matchers.string(),
                                            title: Matchers.string(),
                                            quantity: Matchers.integer(),
                                        }),
                                    },
                                    approvals: [],
                                    created_at: Matchers.iso8601DateTime(),
                                    updated_at: Matchers.iso8601DateTime(),
                                },
                            },
                        });
                });

                it('returns approval details', async () => {
                    const response = await fetch('http://localhost:8080/store/approvals/appr_01JXXX?fields=*cart,*cart.items,*approvals', {
                        headers: {
                            'x-publishable-api-key': 'pk_test_xxx',
                            'Authorization': 'Bearer token_xxx',
                        },
                    });

                    expect(response.status).toBe(200);
                    const data = await response.json();
                    expect(data.approval).toBeDefined();
                    expect(data.approval.id).toBe('appr_01JXXX');
                    expect(data.approval.cart).toBeDefined();
                    expect(data.approval.approvals).toBeDefined();
                });
            });
        });
    }
);
