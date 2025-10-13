/**
 * Script de Teste do Sistema de Fallback
 * Valida os 3 níveis de fallback em cascata
 */

const STOREFRONT_URL = process.env.STOREFRONT_URL || 'http://localhost:3000'
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

const CATEGORIES = [
    'panels',
    'inverters',
    'batteries',
    'structures',
    'cables',
    'accessories',
    'stringboxes',
    'kits'
]

interface TestResult {
    category: string
    success: boolean
    source: string
    productsCount: number
    responseTime: number
    error?: string
}

async function testCategory(category: string): Promise<TestResult> {
    const startTime = Date.now()

    try {
        const response = await fetch(
            `${STOREFRONT_URL}/api/catalog/products?category=${category}&limit=10`,
            {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(15000)
            }
        )

        const responseTime = Date.now() - startTime

        if (!response.ok) {
            return {
                category,
                success: false,
                source: 'unknown',
                productsCount: 0,
                responseTime,
                error: `HTTP ${response.status}: ${response.statusText}`
            }
        }

        const data = await response.json()

        return {
            category,
            success: data.success,
            source: data.meta?.source || response.headers.get('x-data-source') || 'unknown',
            productsCount: data.data?.products?.length || 0,
            responseTime
        }
    } catch (error: any) {
        return {
            category,
            success: false,
            source: 'error',
            productsCount: 0,
            responseTime: Date.now() - startTime,
            error: error.message
        }
    }
}

async function testBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/health`, {
            signal: AbortSignal.timeout(5000)
        })
        return response.ok
    } catch {
        return false
    }
}

async function runTests() {
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('   TESTE DO SISTEMA DE FALLBACK ROBUSTO')
    console.log('═══════════════════════════════════════════════════════\n')

    console.log(`📍 Storefront: ${STOREFRONT_URL}`)
    console.log(`📍 Backend: ${BACKEND_URL}\n`)

    // Verificar saúde do backend
    console.log('🔍 Verificando saúde do backend...')
    const backendHealthy = await testBackendHealth()
    console.log(`   ${backendHealthy ? '✅' : '⚠️ '} Backend: ${backendHealthy ? 'Online' : 'Offline/Degradado'}`)

    if (!backendHealthy) {
        console.log('   ℹ️  Sistema usará fallback API ou arquivos locais\n')
    } else {
        console.log()
    }

    // Testar cada categoria
    console.log('📦 Testando categorias...\n')

    const results: TestResult[] = []

    for (const category of CATEGORIES) {
        process.stdout.write(`   Testing ${category.padEnd(15)}... `)
        const result = await testCategory(category)
        results.push(result)

        if (result.success) {
            console.log(`✅ ${result.productsCount} produtos (${result.source}) [${result.responseTime}ms]`)
        } else {
            console.log(`❌ Falhou: ${result.error}`)
        }
    }

    // Estatísticas
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('   ESTATÍSTICAS')
    console.log('═══════════════════════════════════════════════════════\n')

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    const avgResponseTime = Math.round(
        results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
    )

    // Contagem por fonte
    const sourceCount: Record<string, number> = {}
    results.forEach(r => {
        sourceCount[r.source] = (sourceCount[r.source] || 0) + 1
    })

    console.log(`✅ Sucesso: ${successful}/${CATEGORIES.length}`)
    console.log(`❌ Falhas: ${failed}/${CATEGORIES.length}`)
    console.log(`⏱️  Tempo médio: ${avgResponseTime}ms\n`)

    console.log('📊 Fontes de dados:')
    Object.entries(sourceCount).forEach(([source, count]) => {
        const emoji = source === 'backend' ? '🟢' :
            source === 'fallback-api' ? '🟡' :
                source === 'local-file' ? '🔵' : '🔴'
        console.log(`   ${emoji} ${source.padEnd(15)}: ${count}`)
    })

    // Produtos totais
    const totalProducts = results.reduce((sum, r) => sum + r.productsCount, 0)
    console.log(`\n📦 Total de produtos retornados: ${totalProducts}`)

    // Resultado final
    console.log('\n═══════════════════════════════════════════════════════')
    if (failed === 0) {
        console.log('   ✅ TODOS OS TESTES PASSARAM!')
    } else {
        console.log('   ⚠️  ALGUNS TESTES FALHARAM')
    }
    console.log('═══════════════════════════════════════════════════════\n')

    // Exit code
    process.exit(failed === 0 ? 0 : 1)
}

// Executar testes
runTests().catch(error => {
    console.error('\n❌ Erro fatal nos testes:', error)
    process.exit(1)
})
