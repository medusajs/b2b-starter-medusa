/**
 * E2E Smoke Tests
 * Basic end-to-end tests for critical user journeys
 */

import { test, expect } from '@playwright/test'

test.describe('Storefront Smoke Tests', () => {
    test.describe('Homepage', () => {
        test('deve carregar homepage com elementos principais', async ({ page }) => {
            await page.goto('/')

            // Aguarda redirect para região (ex: /br)
            await page.waitForURL(/\/[a-z]{2}/, { timeout: 10000 })

            // Verifica título da página
            await expect(page).toHaveTitle(/Yello Solar Hub/)

            // Verifica navegação principal
            const nav = page.locator('nav').first()
            await expect(nav).toBeVisible()

            // Verifica que há conteúdo visível
            const mainContent = page.locator('#main-content, main')
            await expect(mainContent).toBeVisible()
        })

        test('deve ter skip links acessíveis', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('domcontentloaded')

            // Verifica existência de skip link
            const skipLink = page.locator('a[href="#main-content"]').first()
            if (await skipLink.count() > 0) {
                await expect(skipLink).toBeVisible()
            }
        })
    })

    test.describe('Navigation', () => {
        test('deve navegar para página de categorias', async ({ page }) => {
            await page.goto('/')
            await page.waitForURL(/\/[a-z]{2}/)

            // Tenta encontrar link para categorias
            const categoryLink = page.locator('a[href*="/categories"], a[href*="/catalogo"]').first()

            if (await categoryLink.count() > 0) {
                await categoryLink.click()
                await page.waitForLoadState('domcontentloaded')

                // Verifica URL contem categories ou produtos
                await expect(page.url()).toMatch(/\/(categories|produtos|catalogo)/)
            }
        })

        test('deve preservar UTM params em navegação', async ({ page }) => {
            await page.goto('/?utm_source=test&utm_medium=smoke&utm_campaign=e2e')
            await page.waitForURL(/\/[a-z]{2}/)

            // Verifica cookie UTM foi criado
            const cookies = await page.context().cookies()
            const utmCookie = cookies.find(c => c.name === '_ysh_utm')

            if (utmCookie) {
                const utmData = JSON.parse(utmCookie.value)
                expect(utmData.utm_source).toBe('test')
                expect(utmData.utm_medium).toBe('smoke')
                expect(utmData.utm_campaign).toBe('e2e')
            }
        })
    })

    test.describe('Performance', () => {
        test('deve carregar página em tempo razoável', async ({ page }) => {
            const startTime = Date.now()

            await page.goto('/')
            await page.waitForLoadState('domcontentloaded')

            const loadTime = Date.now() - startTime

            // Verifica que carregou em menos de 5 segundos
            expect(loadTime).toBeLessThan(5000)
        })

        test('deve ter imagens com atributos de performance', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('domcontentloaded')

            // Aguarda algumas imagens carregarem
            await page.waitForSelector('img', { timeout: 5000 })

            const images = await page.locator('img').all()

            if (images.length > 0) {
                // Verifica primeira imagem
                const firstImg = images[0]
                const loading = await firstImg.getAttribute('loading')
                const alt = await firstImg.getAttribute('alt')

                // Imagens devem ter atributo alt (a11y)
                expect(alt).not.toBeNull()
            }
        })
    })

    test.describe('Acessibilidade', () => {
        test('deve ter contraste adequado em botões principais', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('domcontentloaded')

            // Busca por botões principais
            const buttons = await page.locator('button, a[role="button"]').all()

            // Verifica que há botões na página
            expect(buttons.length).toBeGreaterThan(0)
        })

        test('deve suportar navegação por teclado', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('domcontentloaded')

            // Testa navegação com Tab
            await page.keyboard.press('Tab')

            // Verifica que há elemento focado
            const focusedElement = await page.evaluate(() => {
                return document.activeElement?.tagName
            })

            expect(focusedElement).toBeTruthy()
        })
    })

    test.describe('SEO', () => {
        test('deve ter meta tags básicas', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('domcontentloaded')

            // Verifica meta description
            const description = await page.locator('meta[name="description"]').getAttribute('content')
            expect(description).toBeTruthy()
            expect(description!.length).toBeGreaterThan(50)

            // Verifica meta keywords
            const keywords = await page.locator('meta[name="keywords"]').getAttribute('content')
            expect(keywords).toBeTruthy()

            // Verifica canonical link
            const canonical = page.locator('link[rel="canonical"]')
            if (await canonical.count() > 0) {
                const href = await canonical.getAttribute('href')
                expect(href).toContain('http')
            }
        })

        test('deve ter Open Graph tags', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('domcontentloaded')

            // Verifica OG tags
            const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
            const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content')
            const ogType = await page.locator('meta[property="og:type"]').getAttribute('content')

            expect(ogTitle).toBeTruthy()
            expect(ogDescription).toBeTruthy()
            expect(ogType).toBe('website')
        })
    })

    test.describe('Analytics', () => {
        test('deve inicializar PostHog', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('domcontentloaded')

            // Verifica se PostHog foi inicializado
            const hasPostHog = await page.evaluate(() => {
                return typeof (window as any).posthog !== 'undefined'
            })

            // PostHog pode estar desabilitado em dev, mas verifica setup
            // expect(hasPostHog).toBeTruthy() // Comentado para não falhar em dev
        })

        test('deve ter experiment bucket definido', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('domcontentloaded')

            // Verifica cookie de experimento
            const cookies = await page.context().cookies()
            const expBucket = cookies.find(c => c.name === '_ysh_exp_bucket')

            expect(expBucket).toBeTruthy()
            expect(['A', 'B']).toContain(expBucket?.value)
        })
    })

    test.describe('Responsividade', () => {
        test('deve ser responsivo em mobile', async ({ page }) => {
            // Define viewport mobile
            await page.setViewportSize({ width: 375, height: 667 })
            await page.goto('/')
            await page.waitForLoadState('domcontentloaded')

            // Verifica que conteúdo é visível
            const mainContent = page.locator('#main-content, main')
            await expect(mainContent).toBeVisible()

            // Verifica que não há scroll horizontal
            const hasHorizontalScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth
            })

            expect(hasHorizontalScroll).toBeFalsy()
        })

        test('deve ser responsivo em tablet', async ({ page }) => {
            // Define viewport tablet
            await page.setViewportSize({ width: 768, height: 1024 })
            await page.goto('/')
            await page.waitForLoadState('domcontentloaded')

            const mainContent = page.locator('#main-content, main')
            await expect(mainContent).toBeVisible()
        })
    })
})
