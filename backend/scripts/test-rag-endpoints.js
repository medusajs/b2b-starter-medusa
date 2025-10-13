/**
 * Script de teste dos RAG endpoints
 * 
 * Testa os 4 endpoints RAG end-to-end:
 * - POST /store/rag/ask-helio
 * - POST /store/rag/recommend-products
 * - POST /store/rag/search  
 * - GET /store/rag/search
 * 
 * Uso: node test-rag-endpoints.js
 */

const http = require('http');

const MEDUSA_URL = 'http://localhost:9000';
const QDRANT_API_KEY = 'qdrant_dev_key_foss_2025';

function makeRequest(url, options = {}, postData = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data ? JSON.parse(data) : null,
                    });
                } catch (error) {
                    resolve({ statusCode: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);

        if (postData) {
            req.write(JSON.stringify(postData));
        }

        req.end();
    });
}

async function testListCollections() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 1: GET /store/rag/search - Listar collections');
    console.log('='.repeat(80));

    try {
        const response = await makeRequest(
            `${MEDUSA_URL}/store/rag/search`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log(`Status: ${response.statusCode}`);
        console.log('Response:', JSON.stringify(response.body, null, 2));

        if (response.statusCode === 200) {
            console.log('✅ PASSOU: Collections listadas com sucesso');
            return true;
        } else {
            console.log('❌ FALHOU: Status code inesperado');
            return false;
        }
    } catch (error) {
        console.log('❌ ERRO:', error.message);
        return false;
    }
}

async function testSearch() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 2: POST /store/rag/search - Busca semântica');
    console.log('='.repeat(80));

    try {
        const response = await makeRequest(
            `${MEDUSA_URL}/store/rag/search`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            {
                query: 'inversor híbrido com backup de bateria',
                collection: 'ysh-catalog',
                limit: 5,
            }
        );

        console.log(`Status: ${response.statusCode}`);
        console.log('Response:', JSON.stringify(response.body, null, 2));

        if (response.statusCode === 200) {
            console.log('✅ PASSOU: Busca semântica executada');
            return true;
        } else {
            console.log('❌ FALHOU: Status code inesperado');
            return false;
        }
    } catch (error) {
        console.log('❌ ERRO:', error.message);
        return false;
    }
}

async function testRecommendProducts() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 3: POST /store/rag/recommend-products - Recomendação de produtos');
    console.log('='.repeat(80));

    try {
        const response = await makeRequest(
            `${MEDUSA_URL}/store/rag/recommend-products`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            {
                kwp_target: 5.5,
                budget: 25000,
                location: 'São Paulo, SP',
            }
        );

        console.log(`Status: ${response.statusCode}`);
        console.log('Response:', JSON.stringify(response.body, null, 2));

        if (response.statusCode === 200) {
            console.log('✅ PASSOU: Recomendação de produtos gerada');
            return true;
        } else {
            console.log('❌ FALHOU: Status code inesperado');
            return false;
        }
    } catch (error) {
        console.log('❌ ERRO:', error.message);
        return false;
    }
}

async function testAskHelio() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 4: POST /store/rag/ask-helio - Perguntar para Hélio');
    console.log('='.repeat(80));

    try {
        const response = await makeRequest(
            `${MEDUSA_URL}/store/rag/ask-helio`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            {
                question: 'Qual o melhor kit solar para uma casa que consome 300 kWh por mês?',
                context: {
                    customer_id: 'test-customer',
                    location: 'Rio de Janeiro, RJ',
                },
            }
        );

        console.log(`Status: ${response.statusCode}`);
        console.log('Response:', JSON.stringify(response.body, null, 2));

        if (response.statusCode === 200) {
            console.log('✅ PASSOU: Resposta do Hélio gerada');
            return true;
        } else {
            console.log('❌ FALHOU: Status code inesperado');
            return false;
        }
    } catch (error) {
        console.log('❌ ERRO:', error.message);
        return false;
    }
}

async function main() {
    console.log('🧪 Iniciando testes dos RAG endpoints\n');
    console.log(`URL Base: ${MEDUSA_URL}`);
    console.log(`Qdrant API Key: ${QDRANT_API_KEY}\n`);

    const results = {
        listCollections: false,
        search: false,
        recommendProducts: false,
        askHelio: false,
    };

    // Executar testes
    results.listCollections = await testListCollections();
    await new Promise(resolve => setTimeout(resolve, 1000));

    results.search = await testSearch();
    await new Promise(resolve => setTimeout(resolve, 1000));

    results.recommendProducts = await testRecommendProducts();
    await new Promise(resolve => setTimeout(resolve, 1000));

    results.askHelio = await testAskHelio();

    // Resumo
    console.log('\n' + '='.repeat(80));
    console.log('RESUMO DOS TESTES');
    console.log('='.repeat(80));

    const total = Object.keys(results).length;
    const passed = Object.values(results).filter(v => v).length;
    const failed = total - passed;

    console.log(`\n📊 Resultados:`);
    console.log(`   ✅ Passou: ${passed}/${total}`);
    console.log(`   ❌ Falhou: ${failed}/${total}`);
    console.log(`   📈 Taxa de sucesso: ${((passed / total) * 100).toFixed(1)}%\n`);

    // Detalhe por teste
    console.log('Detalhes:');
    console.log(`   1. GET /store/rag/search:              ${results.listCollections ? '✅' : '❌'}`);
    console.log(`   2. POST /store/rag/search:             ${results.search ? '✅' : '❌'}`);
    console.log(`   3. POST /store/rag/recommend-products: ${results.recommendProducts ? '✅' : '❌'}`);
    console.log(`   4. POST /store/rag/ask-helio:          ${results.askHelio ? '✅' : '❌'}`);

    if (passed === total) {
        console.log('\n🎉 Todos os testes passaram! Sistema RAG operacional.');
    } else {
        console.log('\n⚠️  Alguns testes falharam. Verifique os erros acima.');
        process.exit(1);
    }
}

main();
