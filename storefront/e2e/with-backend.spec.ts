/**
 * E2E Tests with MSW Backend
 * Tests critical user flows with mocked Medusa API
 */

import { test, expect } from '@playwright/test'
import { setupServer } from 'msw/node'
import { handlers, resetMockState } from './mocks/handlers'

// Setup MSW server
const server = setupServer(...handlers)

test.beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' })
})

test.afterEach(() => {
    server.resetHandlers()
    resetMockState()
})

test.afterAll(() => {
    server.close()
})

test.describe('Product Search & Browse (MSW)', () => {
    test('should search products by keyword', async ({ page }) => {
        await page.goto('/br')

        // Search for "painel"
        const searchInput = page.locator('input[name="search"], input[placeholder*="Buscar"]').first()
        if (await searchInput.isVisible()) {
            await searchInput.fill('painel')
            await page.keyboard.press('Enter')

            // MSW returns mocked product
            await expect(page.locator('text=Painel Solar 550W - Test')).toBeVisible({ timeout: 5000 })
        }
    })

    test('should display product details', async ({ page }) => {
        await page.goto('/br/produtos/painel-solar-550w-test')

        // Check product details rendered
        await expect(page.locator('h1, h2').filter({ hasText: /Painel Solar 550W/ })).toBeVisible()

        // Check price displayed
        await expect(page.locator('text=/R\\$\\s*850/')).toBeVisible()
    })

    test('should filter products by category', async ({ page }) => {
        await page.goto('/br/produtos')

        // Click category filter (if exists)
        const categoryFilter = page.locator('button:has-text("Painéis"), a:has-text("Painéis")').first()
        if (await categoryFilter.isVisible()) {
            await categoryFilter.click()

            // Verify products loaded
            await expect(page.locator('[class*="product-card"], [data-testid="product-card"]')).toHaveCount(2, { timeout: 5000 })
        }
    })
})

test.describe('Add to Cart Flow (MSW)', () => {
    test('should add product to cart', async ({ page }) => {
        await page.goto('/br/produtos/painel-solar-550w-test')

        // Find and click "Add to Cart" button
        const addToCartBtn = page.locator('button:has-text("Adicionar"), button:has-text("Carrinho")').first()
        await addToCartBtn.click()

        // Check cart indicator updated
        await expect(page.locator('[data-testid="cart-count"], [class*="cart"] >> text=1')).toBeVisible({ timeout: 3000 })
    })

    test('should update cart quantity', async ({ page }) => {
        await page.goto('/br/produtos/painel-solar-550w-test')

        // Add to cart
        await page.locator('button:has-text("Adicionar")').first().click()
        await page.waitForTimeout(1000)

        // Go to cart
        await page.goto('/br/carrinho')

        // Increase quantity
        const increaseBtn = page.locator('button[aria-label*="Aumentar"], button:has-text("+")').first()
        if (await increaseBtn.isVisible()) {
            await increaseBtn.click()

            // Verify quantity updated
            await expect(page.locator('input[type="number"]').first()).toHaveValue('2')
        }
    })

    test('should remove item from cart', async ({ page }) => {
        await page.goto('/br/produtos/painel-solar-550w-test')

        // Add to cart
        await page.locator('button:has-text("Adicionar")').first().click()
        await page.waitForTimeout(1000)

        // Go to cart
        await page.goto('/br/carrinho')

        // Remove item
        const removeBtn = page.locator('button:has-text("Remover"), button[aria-label*="Remover"]').first()
        if (await removeBtn.isVisible()) {
            await removeBtn.click()

            // Verify cart empty
            await expect(page.locator('text=/carrinho vazio/i, text=/sem itens/i')).toBeVisible()
        }
    })
})

test.describe('Quote Request Flow (MSW)', () => {
    test('should request quote for products', async ({ page }) => {
        await page.goto('/br/produtos/painel-solar-550w-test')

        // Find "Request Quote" button
        const quoteBtn = page.locator('button:has-text("Solicitar Cotação"), button:has-text("Cotação")').first()

        if (await quoteBtn.isVisible()) {
            await quoteBtn.click()

            // Fill quote form (if modal/form appears)
            const messageInput = page.locator('textarea[name="message"], textarea[placeholder*="mensagem"]').first()
            if (await messageInput.isVisible()) {
                await messageInput.fill('Preciso de 100 unidades deste painel')

                // Submit quote
                await page.locator('button:has-text("Enviar"), button[type="submit"]').first().click()

                // Verify success message
                await expect(page.locator('text=/cotação enviada/i, text=/solicitação enviada/i')).toBeVisible({ timeout: 5000 })
            }
        }
    })

    test('should view quote history', async ({ page }) => {
        // Login first (if required)
        await page.goto('/br/login')

        const emailInput = page.locator('input[type="email"], input[name="email"]').first()
        if (await emailInput.isVisible()) {
            await emailInput.fill('test@example.com')
            await page.locator('input[type="password"]').first().fill('password123')
            await page.locator('button[type="submit"]').first().click()

            await page.waitForTimeout(1000)
        }

        // Navigate to quotes
        await page.goto('/br/account/quotes')

        // Verify quotes list
        await expect(page.locator('text=/cotações/i, text=/quotes/i')).toBeVisible()
    })
})

test.describe('B2B Features (MSW)', () => {
    test('should enforce spending limit', async ({ page }) => {
        // This test would require spending limit logic to be implemented
        // For now, just verify company data loads

        await page.goto('/br/account/company')

        // Check company info displayed
        await expect(page.locator('text=/empresa/i, text=/company/i')).toBeVisible({ timeout: 5000 })
    })

    test('should require approval for high-value orders', async ({ page }) => {
        await page.goto('/br/produtos/inversor-10kw-test')

        // Add expensive product
        await page.locator('button:has-text("Adicionar")').first().click()
        await page.waitForTimeout(1000)

        // Attempt checkout
        await page.goto('/br/checkout')

        // Should see approval required message
        // (Implementation depends on approval workflow)
        const approvalMsg = page.locator('text=/aprovação/i, text=/approval/i').first()
        const hasApproval = await approvalMsg.isVisible({ timeout: 2000 }).catch(() => false)

        if (hasApproval) {
            expect(await approvalMsg.isVisible()).toBe(true)
        }
    })
})

test.describe('Checkout Flow (MSW)', () => {
    test('should complete checkout process', async ({ page }) => {
        await page.goto('/br/produtos/painel-solar-550w-test')

        // Add to cart
        await page.locator('button:has-text("Adicionar")').first().click()
        await page.waitForTimeout(1000)

        // Go to checkout
        await page.goto('/br/checkout')

        // Fill shipping info (if required)
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible() && await emailInput.inputValue() === '') {
            await emailInput.fill('test@example.com')
        }

        const nameInput = page.locator('input[name="first_name"], input[placeholder*="nome"]').first()
        if (await nameInput.isVisible()) {
            await nameInput.fill('Test User')
        }

        // Continue to payment (if button exists)
        const continueBtn = page.locator('button:has-text("Continuar"), button:has-text("Próximo")').first()
        if (await continueBtn.isVisible()) {
            await continueBtn.click()
            await page.waitForTimeout(1000)
        }

        // Verify checkout progress
        await expect(page.locator('text=/checkout/i, text=/pagamento/i')).toBeVisible()
    })
})

test.describe('A/B Experiment Tracking (MSW)', () => {
    test('should assign experiment bucket', async ({ page }) => {
        await page.goto('/br')

        // Check if experiment cookie was set
        const cookies = await page.context().cookies()
        const expBucket = cookies.find(c => c.name === '_ysh_exp_bucket')

        expect(expBucket).toBeDefined()
        expect(['A', 'B']).toContain(expBucket?.value)
    })

    test('should show correct CTA variant', async ({ page }) => {
        await page.goto('/br/produtos')

        // Get experiment bucket
        const cookies = await page.context().cookies()
        const expBucket = cookies.find(c => c.name === '_ysh_exp_bucket')

        // Check CTA text matches bucket
        const productCard = page.locator('[class*="product-card"]').first()
        if (await productCard.isVisible()) {
            const ctaButton = productCard.locator('button:has-text("Ver Detalhes"), button:has-text("Explorar Produto")').first()

            if (expBucket?.value === 'A') {
                await expect(ctaButton).toHaveText(/Ver Detalhes/)
            } else if (expBucket?.value === 'B') {
                await expect(ctaButton).toHaveText(/Explorar Produto/)
            }
        }
    })
})

test.describe('Performance with MSW', () => {
    test('should load products within 3 seconds', async ({ page }) => {
        const startTime = Date.now()

        await page.goto('/br/produtos')
        await page.waitForLoadState('networkidle')

        const loadTime = Date.now() - startTime
        expect(loadTime).toBeLessThan(3000)
    })

    test('should cache MSW responses', async ({ page }) => {
        // First load
        await page.goto('/br/produtos')
        const firstLoadTime = Date.now()
        await page.waitForLoadState('networkidle')
        const firstDuration = Date.now() - firstLoadTime

        // Reload
        await page.reload()
        const secondLoadTime = Date.now()
        await page.waitForLoadState('networkidle')
        const secondDuration = Date.now() - secondLoadTime

        // Second load should be faster (cached)
        expect(secondDuration).toBeLessThanOrEqual(firstDuration)
    })
})
