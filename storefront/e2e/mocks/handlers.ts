/**
 * MSW Handlers for Medusa B2B API
 * Mock responses for E2E tests
 */

import { http, HttpResponse } from 'msw'

const MEDUSA_BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

/**
 * Mock Products
 */
const mockProducts = [
    {
        id: 'prod_test_panel_550',
        title: 'Painel Solar 550W - Test',
        handle: 'painel-solar-550w-test',
        description: 'Painel solar de alta eficiência para testes E2E',
        thumbnail: 'https://via.placeholder.com/400x400/FFCC00/000000?text=550W',
        metadata: {
            sku: 'PS-550-TEST',
            manufacturer: 'JA Solar Test',
            model: 'JAM72S30-550/MR-TEST',
            kwp: 0.55,
            efficiency_pct: 21.2,
            tier_recommendation: ['PP'],
            modalidade: 'on-grid'
        },
        variants: [{
            id: 'variant_test_1',
            title: 'Default',
            prices: [{
                amount: 85000,
                currency_code: 'brl'
            }]
        }]
    },
    {
        id: 'prod_test_inverter_10k',
        title: 'Inversor 10kW - Test',
        handle: 'inversor-10kw-test',
        description: 'Inversor trifásico para testes E2E',
        thumbnail: 'https://via.placeholder.com/400x400/0066CC/FFFFFF?text=10kW',
        metadata: {
            sku: 'INV-10K-TEST',
            manufacturer: 'Growatt Test',
            model: 'MIN-10000TL-XH-TEST',
            kwp: 10,
            efficiency_pct: 98.5,
            tier_recommendation: ['P']
        },
        variants: [{
            id: 'variant_test_2',
            title: 'Default',
            prices: [{
                amount: 450000,
                currency_code: 'brl'
            }]
        }]
    }
]

/**
 * Mock Cart
 */
let mockCart = {
    id: 'cart_test_123',
    email: 'test@example.com',
    region_id: 'reg_br',
    items: [] as any[],
    subtotal: 0,
    total: 0,
    metadata: {
        company_id: 'comp_test_123',
        employee_id: 'emp_test_456'
    }
}

/**
 * Mock Company
 */
const mockCompany = {
    id: 'comp_test_123',
    name: 'Empresa Teste E2E',
    spending_limit: 1000000, // R$ 10.000,00
    spending_limit_reset_frequency: 'monthly',
    current_spending: 250000, // R$ 2.500,00
    employees: [
        {
            id: 'emp_test_456',
            customer_id: 'cus_test_789',
            spending_limit: 50000, // R$ 500,00
            current_spending: 10000 // R$ 100,00
        }
    ]
}

/**
 * Handlers
 */
export const handlers = [
    // ========================================
    // PRODUCTS
    // ========================================

    // List products
    http.get(`${MEDUSA_BASE_URL}/store/products`, ({ request }) => {
        const url = new URL(request.url)
        const q = url.searchParams.get('q')

        let filteredProducts = mockProducts
        if (q) {
            filteredProducts = mockProducts.filter(p =>
                p.title.toLowerCase().includes(q.toLowerCase()) ||
                p.description.toLowerCase().includes(q.toLowerCase())
            )
        }

        return HttpResponse.json({
            products: filteredProducts,
            count: filteredProducts.length,
            offset: 0,
            limit: 50
        })
    }),

    // Get single product
    http.get(`${MEDUSA_BASE_URL}/store/products/:id`, ({ params }) => {
        const product = mockProducts.find(p => p.id === params.id || p.handle === params.id)

        if (!product) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json({ product })
    }),

    // ========================================
    // CART
    // ========================================

    // Create cart
    http.post(`${MEDUSA_BASE_URL}/store/carts`, async ({ request }) => {
        const body = await request.json() as any
        mockCart = {
            ...mockCart,
            id: `cart_test_${Date.now()}`,
            region_id: body.region_id || 'reg_br',
            email: body.email
        }

        return HttpResponse.json({ cart: mockCart })
    }),

    // Get cart
    http.get(`${MEDUSA_BASE_URL}/store/carts/:id`, ({ params }) => {
        if (params.id !== mockCart.id) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json({ cart: mockCart })
    }),

    // Add line item to cart
    http.post(`${MEDUSA_BASE_URL}/store/carts/:id/line-items`, async ({ params, request }) => {
        const body = await request.json() as any
        const product = mockProducts.find(p => p.variants[0].id === body.variant_id)

        if (!product) {
            return new HttpResponse(null, { status: 404 })
        }

        const lineItem = {
            id: `item_test_${Date.now()}`,
            cart_id: params.id,
            variant_id: body.variant_id,
            quantity: body.quantity || 1,
            title: product.title,
            unit_price: product.variants[0].prices[0].amount,
            subtotal: product.variants[0].prices[0].amount * (body.quantity || 1)
        }

        mockCart.items.push(lineItem)
        mockCart.subtotal = mockCart.items.reduce((sum, item) => sum + item.subtotal, 0)
        mockCart.total = mockCart.subtotal

        return HttpResponse.json({ cart: mockCart })
    }),

    // Complete cart
    http.post(`${MEDUSA_BASE_URL}/store/carts/:id/complete`, ({ params }) => {
        const order = {
            id: `order_test_${Date.now()}`,
            cart_id: params.id,
            status: 'pending',
            items: mockCart.items,
            total: mockCart.total,
            email: mockCart.email,
            metadata: mockCart.metadata
        }

        return HttpResponse.json({
            type: 'order',
            data: order
        })
    }),

    // ========================================
    // QUOTES
    // ========================================

    // Create quote
    http.post(`${MEDUSA_BASE_URL}/store/quotes`, async ({ request }) => {
        const body = await request.json() as any

        const quote = {
            id: `quote_test_${Date.now()}`,
            status: 'pending',
            customer_id: body.customer_id || 'cus_test_789',
            cart_id: body.cart_id,
            items: body.items || [],
            message: body.message,
            created_at: new Date().toISOString()
        }

        return HttpResponse.json({ quote })
    }),

    // List quotes
    http.get(`${MEDUSA_BASE_URL}/store/quotes`, () => {
        return HttpResponse.json({
            quotes: [
                {
                    id: 'quote_test_1',
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    items: []
                }
            ]
        })
    }),

    // ========================================
    // COMPANY (B2B)
    // ========================================

    // Get company
    http.get(`${MEDUSA_BASE_URL}/store/companies/:id`, ({ params }) => {
        if (params.id !== mockCompany.id) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json({ company: mockCompany })
    }),

    // ========================================
    // CUSTOMER/AUTH
    // ========================================

    // Get current customer
    http.get(`${MEDUSA_BASE_URL}/store/customers/me`, () => {
        return HttpResponse.json({
            customer: {
                id: 'cus_test_789',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                metadata: {
                    company_id: 'comp_test_123',
                    employee_id: 'emp_test_456'
                }
            }
        })
    }),

    // Login
    http.post(`${MEDUSA_BASE_URL}/store/auth`, async ({ request }) => {
        const body = await request.json() as any

        if (body.email === 'test@example.com') {
            return HttpResponse.json({
                customer: {
                    id: 'cus_test_789',
                    email: body.email,
                    first_name: 'Test',
                    last_name: 'User'
                }
            })
        }

        return new HttpResponse(null, { status: 401 })
    }),

    // ========================================
    // REGIONS
    // ========================================

    // List regions
    http.get(`${MEDUSA_BASE_URL}/store/regions`, () => {
        return HttpResponse.json({
            regions: [
                {
                    id: 'reg_br',
                    name: 'Brasil',
                    currency_code: 'brl',
                    countries: [{ iso_2: 'br', name: 'Brasil' }]
                }
            ]
        })
    })
]

/**
 * Reset mock state between tests
 */
export function resetMockState() {
    mockCart = {
        id: 'cart_test_123',
        email: 'test@example.com',
        region_id: 'reg_br',
        items: [],
        subtotal: 0,
        total: 0,
        metadata: {
            company_id: 'comp_test_123',
            employee_id: 'emp_test_456'
        }
    }
}
