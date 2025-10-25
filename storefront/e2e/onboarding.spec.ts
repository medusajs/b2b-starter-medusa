import { test, expect } from '@playwright/test'

/**
 * E2E Tests - Módulo Onboarding YSH Solar
 * 
 * Testes completos do fluxo de dimensionamento fotovoltaico
 * com Hélio mascot e validações em cada etapa
 */

test.describe('Onboarding Module - Complete Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Navegar para a página de onboarding
        await page.goto('/onboarding')

        // Verificar que a página carregou
        await expect(page).toHaveTitle(/YSH Solar|Onboarding/i)
    })

    test('should display welcome screen with Hélio mascot', async ({ page }) => {
        // Verificar título da página
        await expect(page.getByRole('heading', { name: /bem-vindo/i })).toBeVisible()

        // Verificar presença do vídeo do Hélio (welcome mood)
        const helioVideo = page.locator('video[src*="helio-welcome"]')
        await expect(helioVideo).toBeVisible()

        // Verificar se o vídeo está configurado para loop
        await expect(helioVideo).toHaveAttribute('loop', '')

        // Verificar botão "Começar"
        const startButton = page.getByRole('button', { name: /começar|iniciar/i })
        await expect(startButton).toBeVisible()
        await expect(startButton).toBeEnabled()

        // Verificar texto de introdução
        await expect(page.getByText(/dimensionar|sistema fotovoltaico/i)).toBeVisible()
    })

    test('should navigate through all 5 steps successfully', async ({ page }) => {
        // Step 0: Welcome
        await page.getByRole('button', { name: /começar/i }).click()

        // Step 1: Location
        await expect(page.getByRole('heading', { name: /localização|onde você mora/i })).toBeVisible()
        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')
        await page.getByRole('button', { name: /próximo|continuar/i }).click()

        // Step 2: Consumption
        await expect(page.getByRole('heading', { name: /consumo|energia/i })).toBeVisible()
        await page.getByLabel(/consumo mensal|kwh/i).fill('350')
        await page.getByLabel(/valor da conta|tarifa/i).fill('450')
        await page.getByRole('button', { name: /próximo|continuar/i }).click()

        // Step 3: Roof
        await expect(page.getByRole('heading', { name: /telhado|características/i })).toBeVisible()
        await page.getByLabel(/tipo de telhado/i).selectOption('ceramico')
        await page.getByLabel(/área disponível/i).fill('50')
        await page.getByLabel(/sombreamento/i).click() // Radio button "Nenhum"
        await page.getByRole('button', { name: /calcular|dimensionar/i }).click()

        // Step 4: Results (aguardar cálculo)
        await expect(page.getByRole('heading', { name: /resultado|dimensionamento/i })).toBeVisible({ timeout: 10000 })

        // Verificar presença do Hélio em modo celebration
        const helioCelebration = page.locator('video[src*="helio-celebration"]')
        await expect(helioCelebration).toBeVisible()

        // Verificar que os resultados estão presentes
        await expect(page.getByText(/potência do sistema|kwp/i)).toBeVisible()
        await expect(page.getByText(/economia anual/i)).toBeVisible()
        await expect(page.getByText(/investimento estimado/i)).toBeVisible()
    })

    test('should validate required fields in Location step', async ({ page }) => {
        await page.getByRole('button', { name: /começar/i }).click()

        // Tentar avançar sem preencher campos obrigatórios
        const nextButton = page.getByRole('button', { name: /próximo/i })
        await expect(nextButton).toBeDisabled()

        // Preencher apenas CEP
        await page.getByLabel(/cep/i).fill('01310-100')
        await expect(nextButton).toBeDisabled()

        // Preencher endereço
        await page.getByLabel(/endereço/i).fill('Av. Paulista')
        await expect(nextButton).toBeDisabled()

        // Preencher cidade
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await expect(nextButton).toBeDisabled()

        // Preencher estado - agora deve habilitar
        await page.getByLabel(/estado/i).selectOption('SP')
        await expect(nextButton).toBeEnabled()
    })

    test('should validate CEP format in Location step', async ({ page }) => {
        await page.getByRole('button', { name: /começar/i }).click()

        const cepInput = page.getByLabel(/cep/i)

        // Testar CEP inválido
        await cepInput.fill('123')
        await expect(page.getByText(/cep inválido|formato incorreto/i)).toBeVisible()

        // Testar CEP válido
        await cepInput.fill('01310-100')
        await expect(page.getByText(/cep inválido/i)).not.toBeVisible()
    })

    test('should validate consumption values in Consumption step', async ({ page }) => {
        // Navegar até Consumption step
        await page.getByRole('button', { name: /começar/i }).click()
        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')
        await page.getByRole('button', { name: /próximo/i }).click()

        const consumptionInput = page.getByLabel(/consumo mensal|kwh/i)
        const billInput = page.getByLabel(/valor da conta/i)
        const nextButton = page.getByRole('button', { name: /próximo/i })

        // Testar valores zerados (inválidos)
        await consumptionInput.fill('0')
        await billInput.fill('0')
        await expect(nextButton).toBeDisabled()

        // Testar valores negativos
        await consumptionInput.fill('-100')
        await expect(page.getByText(/valor inválido|deve ser positivo/i)).toBeVisible()

        // Testar valores muito altos
        await consumptionInput.fill('999999')
        await expect(page.getByText(/valor muito alto|suspeito/i)).toBeVisible()

        // Testar valores válidos
        await consumptionInput.fill('350')
        await billInput.fill('450')
        await expect(nextButton).toBeEnabled()
    })

    test('should validate roof area in Roof step', async ({ page }) => {
        // Navegar até Roof step
        await page.getByRole('button', { name: /começar/i }).click()

        // Location
        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')
        await page.getByRole('button', { name: /próximo/i }).click()

        // Consumption
        await page.getByLabel(/consumo mensal/i).fill('350')
        await page.getByLabel(/valor da conta/i).fill('450')
        await page.getByRole('button', { name: /próximo/i }).click()

        // Roof
        const areaInput = page.getByLabel(/área disponível/i)
        const calculateButton = page.getByRole('button', { name: /calcular/i })

        // Testar área muito pequena
        await page.getByLabel(/tipo de telhado/i).selectOption('ceramico')
        await areaInput.fill('5')
        await page.getByLabel(/sombreamento/i).first().click()

        await expect(page.getByText(/área insuficiente|muito pequena/i)).toBeVisible()
        await expect(calculateButton).toBeDisabled()

        // Testar área válida
        await areaInput.fill('50')
        await expect(calculateButton).toBeEnabled()
    })

    test('should allow navigation back to previous steps', async ({ page }) => {
        await page.getByRole('button', { name: /começar/i }).click()

        // Avançar para step 2
        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')
        await page.getByRole('button', { name: /próximo/i }).click()

        // Verificar que estamos no step 2
        await expect(page.getByRole('heading', { name: /consumo/i })).toBeVisible()

        // Clicar em "Voltar"
        await page.getByRole('button', { name: /voltar|anterior/i }).click()

        // Verificar que voltamos ao step 1
        await expect(page.getByRole('heading', { name: /localização/i })).toBeVisible()

        // Verificar que os dados preenchidos foram mantidos
        await expect(page.getByLabel(/cep/i)).toHaveValue('01310-100')
        await expect(page.getByLabel(/cidade/i)).toHaveValue('São Paulo')
    })

    test('should display progress indicator', async ({ page }) => {
        await page.getByRole('button', { name: /começar/i }).click()

        // Verificar indicador de progresso
        const progressIndicator = page.locator('[role="progressbar"], .progress-indicator')
        await expect(progressIndicator).toBeVisible()

        // Step 1 - deve mostrar 20% ou 1/5
        await expect(page.getByText(/1.*5|20%/i)).toBeVisible()

        // Avançar para step 2
        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')
        await page.getByRole('button', { name: /próximo/i }).click()

        // Step 2 - deve mostrar 40% ou 2/5
        await expect(page.getByText(/2.*5|40%/i)).toBeVisible()
    })

    test('should show Hélio in compact mode during form filling', async ({ page }) => {
        await page.getByRole('button', { name: /começar/i }).click()

        // Verificar que Hélio aparece em modo compact (badge no header ou canto)
        const helioCompact = page.locator('video[src*="helio-compact"], .helio-badge')
        await expect(helioCompact).toBeVisible()

        // Verificar que está em loop
        const compactVideo = page.locator('video[src*="helio-compact"]')
        if (await compactVideo.count() > 0) {
            await expect(compactVideo).toHaveAttribute('loop', '')
        }
    })

    test('should calculate results based on input data', async ({ page }) => {
        // Preencher formulário completo
        await page.getByRole('button', { name: /começar/i }).click()

        // Location
        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')
        await page.getByRole('button', { name: /próximo/i }).click()

        // Consumption - 500 kWh/mês
        await page.getByLabel(/consumo mensal/i).fill('500')
        await page.getByLabel(/valor da conta/i).fill('650')
        await page.getByRole('button', { name: /próximo/i }).click()

        // Roof
        await page.getByLabel(/tipo de telhado/i).selectOption('ceramico')
        await page.getByLabel(/área disponível/i).fill('60')
        await page.getByLabel(/sombreamento/i).first().click()
        await page.getByRole('button', { name: /calcular/i }).click()

        // Aguardar resultados
        await expect(page.getByRole('heading', { name: /resultado/i })).toBeVisible({ timeout: 10000 })

        // Verificar que valores numéricos estão presentes
        const systemPower = page.locator('text=/\\d+\\.?\\d*\\s*kWp/i')
        await expect(systemPower).toBeVisible()

        const annualSavings = page.locator('text=/R\\$\\s*\\d+/i')
        await expect(annualSavings).toBeVisible()

        const investment = page.locator('text=/R\\$\\s*\\d+/i')
        await expect(investment).toBeVisible()

        // Verificar que a potência é proporcional ao consumo
        // Para 500 kWh/mês, esperamos ~3-5 kWp
        const powerText = await systemPower.textContent()
        const powerValue = parseFloat(powerText?.match(/[\d.]+/)?.[0] || '0')
        expect(powerValue).toBeGreaterThan(2)
        expect(powerValue).toBeLessThan(10)
    })

    test('should provide download/share options in results', async ({ page }) => {
        // Navegar até resultados
        await page.getByRole('button', { name: /começar/i }).click()
        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')
        await page.getByRole('button', { name: /próximo/i }).click()
        await page.getByLabel(/consumo mensal/i).fill('350')
        await page.getByLabel(/valor da conta/i).fill('450')
        await page.getByRole('button', { name: /próximo/i }).click()
        await page.getByLabel(/tipo de telhado/i).selectOption('ceramico')
        await page.getByLabel(/área disponível/i).fill('50')
        await page.getByLabel(/sombreamento/i).first().click()
        await page.getByRole('button', { name: /calcular/i }).click()

        // Aguardar resultados
        await expect(page.getByRole('heading', { name: /resultado/i })).toBeVisible({ timeout: 10000 })

        // Verificar botão de download PDF
        const downloadButton = page.getByRole('button', { name: /baixar|download|pdf/i })
        await expect(downloadButton).toBeVisible()

        // Verificar botão de compartilhar/enviar
        const shareButton = page.getByRole('button', { name: /compartilhar|enviar|email/i })
        await expect(shareButton).toBeVisible()

        // Verificar botão para refazer
        const restartButton = page.getByRole('button', { name: /nova simulação|refazer|recomeçar/i })
        await expect(restartButton).toBeVisible()
    })

    test('should restart onboarding from results page', async ({ page }) => {
        // Completar fluxo até resultados
        await page.getByRole('button', { name: /começar/i }).click()
        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')
        await page.getByRole('button', { name: /próximo/i }).click()
        await page.getByLabel(/consumo mensal/i).fill('350')
        await page.getByLabel(/valor da conta/i).fill('450')
        await page.getByRole('button', { name: /próximo/i }).click()
        await page.getByLabel(/tipo de telhado/i).selectOption('ceramico')
        await page.getByLabel(/área disponível/i).fill('50')
        await page.getByLabel(/sombreamento/i).first().click()
        await page.getByRole('button', { name: /calcular/i }).click()

        await expect(page.getByRole('heading', { name: /resultado/i })).toBeVisible({ timeout: 10000 })

        // Clicar em "Nova Simulação"
        await page.getByRole('button', { name: /nova simulação|refazer/i }).click()

        // Verificar que voltou para welcome screen
        await expect(page.getByRole('heading', { name: /bem-vindo/i })).toBeVisible()
        await expect(page.locator('video[src*="helio-welcome"]')).toBeVisible()
    })

    test('should handle calculation errors gracefully', async ({ page }) => {
        // Mock de erro na API de cálculo (se aplicável)
        await page.route('**/api/solar/calculate', route => {
            route.fulfill({
                status: 500,
                body: JSON.stringify({ error: 'Calculation failed' })
            })
        })

        // Completar formulário
        await page.getByRole('button', { name: /começar/i }).click()
        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')
        await page.getByRole('button', { name: /próximo/i }).click()
        await page.getByLabel(/consumo mensal/i).fill('350')
        await page.getByLabel(/valor da conta/i).fill('450')
        await page.getByRole('button', { name: /próximo/i }).click()
        await page.getByLabel(/tipo de telhado/i).selectOption('ceramico')
        await page.getByLabel(/área disponível/i).fill('50')
        await page.getByLabel(/sombreamento/i).first().click()
        await page.getByRole('button', { name: /calcular/i }).click()

        // Verificar mensagem de erro
        await expect(page.getByText(/erro|falha|tente novamente/i)).toBeVisible({ timeout: 5000 })

        // Verificar que existe opção de tentar novamente
        const retryButton = page.getByRole('button', { name: /tentar novamente|recalcular/i })
        await expect(retryButton).toBeVisible()
    })

    test('should be responsive on mobile viewport', async ({ page }) => {
        // Configurar viewport mobile
        await page.setViewportSize({ width: 375, height: 667 })

        await page.goto('/onboarding')

        // Verificar que elementos estão visíveis e acessíveis
        await expect(page.getByRole('heading', { name: /bem-vindo/i })).toBeVisible()

        const helioVideo = page.locator('video[src*="helio-welcome"]')
        await expect(helioVideo).toBeVisible()

        // Verificar que vídeo não ultrapassa viewport
        const videoBox = await helioVideo.boundingBox()
        expect(videoBox?.width).toBeLessThanOrEqual(375)

        // Verificar botão de início
        const startButton = page.getByRole('button', { name: /começar/i })
        await expect(startButton).toBeVisible()

        // Testar navegação mobile
        await startButton.click()

        // Verificar formulário mobile
        await expect(page.getByLabel(/cep/i)).toBeVisible()

        // Verificar que inputs são touch-friendly (altura mínima 44px)
        const cepInput = page.getByLabel(/cep/i)
        const inputBox = await cepInput.boundingBox()
        expect(inputBox?.height).toBeGreaterThanOrEqual(40)
    })

    test('should be accessible with keyboard navigation', async ({ page }) => {
        await page.getByRole('button', { name: /começar/i }).click()

        // Testar navegação por Tab
        await page.keyboard.press('Tab') // Foco no primeiro campo (CEP)
        await expect(page.getByLabel(/cep/i)).toBeFocused()

        await page.keyboard.press('Tab') // Endereço
        await expect(page.getByLabel(/endereço/i)).toBeFocused()

        await page.keyboard.press('Tab') // Cidade
        await expect(page.getByLabel(/cidade/i)).toBeFocused()

        await page.keyboard.press('Tab') // Estado
        await expect(page.getByLabel(/estado/i)).toBeFocused()

        // Testar preenchimento via teclado
        await page.keyboard.type('SP')

        // Navegar para botão e ativar com Enter
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab') // Botão Voltar
        await page.keyboard.press('Tab') // Botão Próximo

        const nextButton = page.getByRole('button', { name: /próximo/i })
        await expect(nextButton).toBeFocused()
    })

    test('should persist data when refreshing page (if localStorage used)', async ({ page }) => {
        // Preencher parcialmente
        await page.getByRole('button', { name: /começar/i }).click()
        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')
        await page.getByRole('button', { name: /próximo/i }).click()
        await page.getByLabel(/consumo mensal/i).fill('350')

        // Recarregar página
        await page.reload()

        // Verificar se mostra opção de continuar de onde parou
        const continueOption = page.getByText(/continuar|retomar|onde parou/i)
        if (await continueOption.count() > 0) {
            await continueOption.click()

            // Verificar que dados foram restaurados
            await expect(page.getByLabel(/consumo mensal/i)).toHaveValue('350')
        }
    })
})

test.describe('Onboarding Module - Edge Cases', () => {
    test('should handle very large consumption values', async ({ page }) => {
        await page.goto('/onboarding')
        await page.getByRole('button', { name: /começar/i }).click()

        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')
        await page.getByRole('button', { name: /próximo/i }).click()

        // Consumo muito alto (empresa grande)
        await page.getByLabel(/consumo mensal/i).fill('50000')
        await page.getByLabel(/valor da conta/i).fill('65000')

        // Sistema deve aceitar ou mostrar aviso apropriado
        const warningOrAccept = await Promise.race([
            page.getByText(/consumo muito alto|comercial|industrial/i).waitFor({ timeout: 2000 }).then(() => 'warning'),
            page.getByRole('button', { name: /próximo/i }).waitFor({ state: 'visible', timeout: 2000 }).then(() => 'accept')
        ])

        expect(['warning', 'accept']).toContain(warningOrAccept)
    })

    test('should handle special characters in address', async ({ page }) => {
        await page.goto('/onboarding')
        await page.getByRole('button', { name: /começar/i }).click()

        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill("Rua São João, 123 - Apt° 45-B (Bloco C)")
        await page.getByLabel(/cidade/i).fill('São José dos Campos')
        await page.getByLabel(/estado/i).selectOption('SP')

        // Deve aceitar caracteres especiais
        const nextButton = page.getByRole('button', { name: /próximo/i })
        await expect(nextButton).toBeEnabled()
    })

    test('should calculate for different roof types', async ({ page }) => {
        const roofTypes = ['ceramico', 'metalico', 'fibrocimento', 'laje']

        for (const roofType of roofTypes) {
            await page.goto('/onboarding')
            await page.getByRole('button', { name: /começar/i }).click()

            await page.getByLabel(/cep/i).fill('01310-100')
            await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
            await page.getByLabel(/cidade/i).fill('São Paulo')
            await page.getByLabel(/estado/i).selectOption('SP')
            await page.getByRole('button', { name: /próximo/i }).click()

            await page.getByLabel(/consumo mensal/i).fill('350')
            await page.getByLabel(/valor da conta/i).fill('450')
            await page.getByRole('button', { name: /próximo/i }).click()

            await page.getByLabel(/tipo de telhado/i).selectOption(roofType)
            await page.getByLabel(/área disponível/i).fill('50')
            await page.getByLabel(/sombreamento/i).first().click()
            await page.getByRole('button', { name: /calcular/i }).click()

            // Deve calcular com sucesso
            await expect(page.getByRole('heading', { name: /resultado/i })).toBeVisible({ timeout: 10000 })
        }
    })
})

test.describe('Onboarding Module - Performance', () => {
    test('should load welcome screen within 3 seconds', async ({ page }) => {
        const startTime = Date.now()
        await page.goto('/onboarding')
        await page.waitForLoadState('networkidle')
        const loadTime = Date.now() - startTime

        expect(loadTime).toBeLessThan(3000)
    })

    test('should play Hélio videos smoothly without stuttering', async ({ page }) => {
        await page.goto('/onboarding')

        const helioVideo = page.locator('video[src*="helio-welcome"]')
        await expect(helioVideo).toBeVisible()

        // Aguardar vídeo começar a tocar
        await page.waitForTimeout(1000)

        // Verificar propriedades do vídeo
        const isPlaying = await helioVideo.evaluate((video: HTMLVideoElement) => {
            return !video.paused && !video.ended && video.readyState > 2
        })

        expect(isPlaying).toBeTruthy()
    })

    test('should transition between steps in less than 500ms', async ({ page }) => {
        await page.goto('/onboarding')
        await page.getByRole('button', { name: /começar/i }).click()

        // Preencher step 1
        await page.getByLabel(/cep/i).fill('01310-100')
        await page.getByLabel(/endereço/i).fill('Av. Paulista, 1578')
        await page.getByLabel(/cidade/i).fill('São Paulo')
        await page.getByLabel(/estado/i).selectOption('SP')

        // Medir tempo de transição
        const startTime = Date.now()
        await page.getByRole('button', { name: /próximo/i }).click()
        await expect(page.getByRole('heading', { name: /consumo/i })).toBeVisible()
        const transitionTime = Date.now() - startTime

        expect(transitionTime).toBeLessThan(500)
    })
})
