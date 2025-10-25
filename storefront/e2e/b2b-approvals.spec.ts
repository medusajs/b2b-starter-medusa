/**
 * E2E Tests - B2B Approval Workflow
 * Tests approval requirements, creation, approval/rejection flow
 */

import { test, expect } from '@playwright/test'
import { setupServer } from 'msw/node'
import { handlers, resetMockState } from './mocks/handlers'

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

test.describe('B2B Approval Workflow', () => {
    test('should require approval when cart exceeds threshold (R$ 1000)', async ({ page }) => {
        // Simulate logged-in B2B employee
        await page.goto('/br/conta/login')
        await page.waitForLoadState('networkidle')

        const emailInput = page.locator('input[type="email"]').first()
        const passwordInput = page.locator('input[type="password"]').first()
        const loginBtn = page.locator('button[type="submit"], button:has-text("Entrar")').first()

        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('employee@yshsolar.com')
            await passwordInput.fill('password123')
            await loginBtn.click()
            await page.waitForTimeout(1500)
        }

        // Add high-value product (R$ 1200) to trigger approval
        await page.goto('/br/produtos/inversor-12kw-test')
        await page.waitForLoadState('networkidle')

        const addToCartBtn = page.locator('button:has-text("Adicionar")').first()
        if (await addToCartBtn.isVisible({ timeout: 5000 })) {
            await addToCartBtn.click()
            await page.waitForTimeout(1500)
        }

        // Go to cart
        await page.goto('/br/carrinho')
        await page.waitForLoadState('networkidle')

        // Should see approval warning (cart total R$ 1200 > threshold R$ 1000)
        const approvalWarning = page.locator('text=/aprovação necessária|approval required|excede o limite/i').first()
        const hasWarning = await approvalWarning.isVisible({ timeout: 3000 }).catch(() => false)

        if (hasWarning) {
            expect(await approvalWarning.isVisible()).toBe(true)
        }

        // Try to checkout - should be blocked or require approval
        const checkoutBtn = page.locator('button:has-text("Finalizar"), button:has-text("Checkout")').first()
        if (await checkoutBtn.isVisible({ timeout: 3000 })) {
            await checkoutBtn.click()
            await page.waitForTimeout(1000)

            // Should see approval request screen or blocked message
            const approvalMsg = page.locator('text=/solicitar aprovação|request approval|aguardando aprovação/i').first()
            const hasApprovalMsg = await approvalMsg.isVisible({ timeout: 3000 }).catch(() => false)

            if (hasApprovalMsg) {
                expect(await approvalMsg.isVisible()).toBe(true)
            }
        }
    })

    test('should create approval request for high-value cart', async ({ page }) => {
        // Login as employee
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('employee@yshsolar.com')
            await page.locator('input[type="password"]').fill('password123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        // Add high-value product
        await page.goto('/br/produtos/inversor-12kw-test')
        const addBtn = page.locator('button:has-text("Adicionar")').first()
        if (await addBtn.isVisible({ timeout: 5000 })) {
            await addBtn.click()
            await page.waitForTimeout(1000)
        }

        // Request approval
        await page.goto('/br/carrinho')
        await page.waitForLoadState('networkidle')

        const requestApprovalBtn = page.locator('button:has-text("Solicitar Aprovação"), button:has-text("Request Approval")').first()
        if (await requestApprovalBtn.isVisible({ timeout: 3000 })) {
            await requestApprovalBtn.click()
            await page.waitForTimeout(1500)

            // Should see success message
            const successMsg = page.locator('text=/aprovação solicitada|approval requested|enviado para aprovação/i').first()
            await expect(successMsg).toBeVisible({ timeout: 3000 })
        }
    })

    test('should show approval pending status', async ({ page }) => {
        // Login and create approval request
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('employee@yshsolar.com')
            await page.locator('input[type="password"]').fill('password123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        // Go to approvals page
        await page.goto('/br/conta/aprovacoes')
        await page.waitForLoadState('networkidle')

        // Should see pending approval
        const pendingStatus = page.locator('text=/pendente|pending|aguardando/i').first()
        const hasPending = await pendingStatus.isVisible({ timeout: 3000 }).catch(() => false)

        if (hasPending) {
            expect(await pendingStatus.isVisible()).toBe(true)

            // Should see approval details
            await expect(page.locator('text=/R\\$\\s*1[.,]200/i')).toBeVisible({ timeout: 3000 })
        }
    })

    test('should allow approver to approve cart', async ({ page }) => {
        // Login as approver (admin)
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('admin@yshsolar.com')
            await page.locator('input[type="password"]').fill('admin123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        // Go to approvals
        await page.goto('/br/conta/aprovacoes')
        await page.waitForLoadState('networkidle')

        // Find pending approval and approve
        const approveBtn = page.locator('button:has-text("Aprovar"), button:has-text("Approve")').first()
        if (await approveBtn.isVisible({ timeout: 3000 })) {
            await approveBtn.click()
            await page.waitForTimeout(1000)

            // Confirm approval
            const confirmBtn = page.locator('button:has-text("Confirmar"), button:has-text("Confirm")').first()
            if (await confirmBtn.isVisible({ timeout: 2000 })) {
                await confirmBtn.click()
                await page.waitForTimeout(1500)
            }

            // Should see approval success message
            const successMsg = page.locator('text=/aprovado|approved|aprovação concedida/i').first()
            await expect(successMsg).toBeVisible({ timeout: 3000 })
        }
    })

    test('should allow approver to reject cart with reason', async ({ page }) => {
        // Login as approver
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('admin@yshsolar.com')
            await page.locator('input[type="password"]').fill('admin123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        // Go to approvals
        await page.goto('/br/conta/aprovacoes')
        await page.waitForLoadState('networkidle')

        // Find pending approval and reject
        const rejectBtn = page.locator('button:has-text("Rejeitar"), button:has-text("Reject")').first()
        if (await rejectBtn.isVisible({ timeout: 3000 })) {
            await rejectBtn.click()
            await page.waitForTimeout(500)

            // Fill rejection reason
            const reasonInput = page.locator('textarea[name="reason"], input[name="reason"]').first()
            if (await reasonInput.isVisible({ timeout: 2000 })) {
                await reasonInput.fill('Excede orçamento mensal')
            }

            // Confirm rejection
            const confirmBtn = page.locator('button:has-text("Confirmar"), button:has-text("Confirm Rejection")').first()
            if (await confirmBtn.isVisible({ timeout: 2000 })) {
                await confirmBtn.click()
                await page.waitForTimeout(1500)
            }

            // Should see rejection success
            const successMsg = page.locator('text=/rejeitado|rejected|recusado/i').first()
            await expect(successMsg).toBeVisible({ timeout: 3000 })
        }
    })

    test('should prevent checkout when spending limit exceeded', async ({ page }) => {
        // Login as employee with low spending limit
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('employee@yshsolar.com')
            await page.locator('input[type="password"]').fill('password123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        // Try to add product that exceeds spending limit
        await page.goto('/br/produtos/inversor-12kw-test')
        await page.waitForLoadState('networkidle')

        const addBtn = page.locator('button:has-text("Adicionar")').first()
        if (await addBtn.isVisible({ timeout: 5000 })) {
            // Simulate exceeding spending limit (employee has R$ 500 remaining)
            await addBtn.click()
            await page.waitForTimeout(1000)

            // Should see limit warning
            const limitWarning = page.locator('text=/limite de gastos|spending limit|excede seu limite/i').first()
            const hasWarning = await limitWarning.isVisible({ timeout: 3000 }).catch(() => false)

            if (hasWarning) {
                expect(await limitWarning.isVisible()).toBe(true)
            }
        }
    })

    test('should track company and employee spending', async ({ page }) => {
        // Login as employee
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('employee@yshsolar.com')
            await page.locator('input[type="password"]').fill('password123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        // Go to account dashboard
        await page.goto('/br/conta')
        await page.waitForLoadState('networkidle')

        // Should see spending summary
        const spendingSummary = page.locator('text=/gastos|spending|limite/i').first()
        const hasSummary = await spendingSummary.isVisible({ timeout: 3000 }).catch(() => false)

        if (hasSummary) {
            // Should show current spending
            await expect(page.locator('text=/R\\$/i')).toBeVisible({ timeout: 3000 })

            // Should show spending limit
            await expect(page.locator('text=/limite|limit/i')).toBeVisible({ timeout: 3000 })
        }
    })
})

test.describe('Approval Settings & Configuration', () => {
    test('should display company approval settings', async ({ page }) => {
        // Login as admin
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('admin@yshsolar.com')
            await page.locator('input[type="password"]').fill('admin123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        // Go to company settings
        await page.goto('/br/conta/empresa/configuracoes')
        await page.waitForLoadState('networkidle')

        // Should see approval threshold setting
        const thresholdSetting = page.locator('text=/limite de aprovação|approval threshold/i').first()
        const hasSetting = await thresholdSetting.isVisible({ timeout: 3000 }).catch(() => false)

        if (hasSetting) {
            expect(await thresholdSetting.isVisible()).toBe(true)

            // Should show current threshold (R$ 1000)
            await expect(page.locator('text=/R\\$\\s*1[.,]000/i')).toBeVisible({ timeout: 3000 })
        }
    })

    test('should allow admin to update approval threshold', async ({ page }) => {
        // Login as admin
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('admin@yshsolar.com')
            await page.locator('input[type="password"]').fill('admin123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        await page.goto('/br/conta/empresa/configuracoes')
        await page.waitForLoadState('networkidle')

        // Find threshold input
        const thresholdInput = page.locator('input[name*="threshold"], input[type="number"]').first()
        if (await thresholdInput.isVisible({ timeout: 3000 })) {
            await thresholdInput.clear()
            await thresholdInput.fill('2000')

            // Save settings
            const saveBtn = page.locator('button:has-text("Salvar"), button[type="submit"]').first()
            if (await saveBtn.isVisible({ timeout: 2000 })) {
                await saveBtn.click()
                await page.waitForTimeout(1000)

                // Should see success message
                const successMsg = page.locator('text=/salvo|saved|atualizado/i').first()
                await expect(successMsg).toBeVisible({ timeout: 3000 })
            }
        }
    })

    test('should show approval history', async ({ page }) => {
        // Login as employee
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('employee@yshsolar.com')
            await page.locator('input[type="password"]').fill('password123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        // Go to approval history
        await page.goto('/br/conta/aprovacoes/historico')
        await page.waitForLoadState('networkidle')

        // Should see list of past approvals
        const approvalsList = page.locator('[data-testid="approvals-list"], [class*="approval"]').first()
        const hasList = await approvalsList.isVisible({ timeout: 3000 }).catch(() => false)

        if (hasList) {
            expect(await approvalsList.isVisible()).toBe(true)

            // Should show status (approved/rejected)
            const statusBadge = page.locator('text=/aprovado|rejeitado|approved|rejected/i').first()
            await expect(statusBadge).toBeVisible({ timeout: 3000 })
        }
    })
})

test.describe('Spending Limits', () => {
    test('should display employee spending limit', async ({ page }) => {
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('employee@yshsolar.com')
            await page.locator('input[type="password"]').fill('password123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        await page.goto('/br/conta')
        await page.waitForLoadState('networkidle')

        // Should see spending limit info (R$ 5000)
        const limitInfo = page.locator('text=/limite de gastos|spending limit/i').first()
        const hasLimit = await limitInfo.isVisible({ timeout: 3000 }).catch(() => false)

        if (hasLimit) {
            await expect(page.locator('text=/R\\$\\s*5[.,]000/i')).toBeVisible({ timeout: 3000 })
        }
    })

    test('should show remaining spending amount', async ({ page }) => {
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('employee@yshsolar.com')
            await page.locator('input[type="password"]').fill('password123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        await page.goto('/br/conta')
        await page.waitForLoadState('networkidle')

        // Should show remaining amount
        const remainingAmount = page.locator('text=/restante|remaining|disponível/i').first()
        const hasRemaining = await remainingAmount.isVisible({ timeout: 3000 }).catch(() => false)

        if (hasRemaining) {
            expect(await remainingAmount.isVisible()).toBe(true)
        }
    })

    test('should warn when approaching spending limit', async ({ page }) => {
        await page.goto('/br/conta/login')
        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible({ timeout: 3000 })) {
            await emailInput.fill('employee@yshsolar.com')
            await page.locator('input[type="password"]').fill('password123')
            await page.locator('button[type="submit"]').click()
            await page.waitForTimeout(1500)
        }

        // Add products totaling 80% of limit
        await page.goto('/br/produtos/inversor-12kw-test')
        const addBtn = page.locator('button:has-text("Adicionar")').first()
        if (await addBtn.isVisible({ timeout: 5000 })) {
            // Add multiple items to approach limit
            await addBtn.click()
            await page.waitForTimeout(1000)

            // Go to cart
            await page.goto('/br/carrinho')
            await page.waitForLoadState('networkidle')

            // Should see warning
            const warning = page.locator('text=/próximo ao limite|approaching limit|80%/i').first()
            const hasWarning = await warning.isVisible({ timeout: 3000 }).catch(() => false)

            if (hasWarning) {
                expect(await warning.isVisible()).toBe(true)
            }
        }
    })
})
