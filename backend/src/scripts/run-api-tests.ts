#!/usr/bin/env node

import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navegar para o diretório correto do backend
const backendDir = path.resolve(__dirname, '../../../');
process.chdir(backendDir);

async function testCatalogAPIs() {
    const baseUrl = 'http://localhost:3000';

    console.log('🧪 Testando APIs do Catálogo YSH...\n');

    // Aguardar servidor iniciar
    console.log('⏳ Aguardando servidor iniciar...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ Pronto para testar!\n');

    try {
        // 1. Testar endpoint principal
        console.log('1️⃣ Testando GET /store/catalog');
        const catalogResponse = await fetch(`${baseUrl}/store/catalog`);
        if (catalogResponse.ok) {
            const catalogData = await catalogResponse.json();
            console.log('✅ Sucesso!');
            console.log(`   📊 ${catalogData.total_categories} categorias`);
            console.log(`   🏭 ${catalogData.total_manufacturers} fabricantes\n`);
        } else {
            console.log('❌ Falhou:', catalogResponse.status, catalogResponse.statusText);
        }

        // 2. Testar lista de fabricantes
        console.log('2️⃣ Testando GET /store/catalog/manufacturers');
        const manufacturersResponse = await fetch(`${baseUrl}/store/catalog/manufacturers`);
        if (manufacturersResponse.ok) {
            const manufacturersData = await manufacturersResponse.json();
            console.log('✅ Sucesso!');
            console.log(`   🏭 ${manufacturersData.manufacturers.length} fabricantes encontrados`);
            console.log(`   📋 Primeiros 5: ${manufacturersData.manufacturers.slice(0, 5).join(', ')}\n`);
        } else {
            console.log('❌ Falhou:', manufacturersResponse.status, manufacturersResponse.statusText);
        }

        // 3. Testar categoria específica (inverters)
        console.log('3️⃣ Testando GET /store/catalog/inverters');
        const invertersResponse = await fetch(`${baseUrl}/store/catalog/inverters`);
        if (invertersResponse.ok) {
            const invertersData = await invertersResponse.json();
            console.log('✅ Sucesso!');
            console.log(`   🔌 ${invertersData.total} inversores encontrados`);
            if (invertersData.products.length > 0) {
                const sample = invertersData.products[0];
                console.log(`   📋 Exemplo: ${sample.name} (${sample.manufacturer})`);
            }
            console.log('');
        } else {
            console.log('❌ Falhou:', invertersResponse.status, invertersResponse.statusText);
        }

        // 4. Testar produto específico
        console.log('4️⃣ Testando GET /store/catalog/inverters/DEYE-SUN2250G4');
        const productResponse = await fetch(`${baseUrl}/store/catalog/inverters/DEYE-SUN2250G4`);
        if (productResponse.ok) {
            const productData = await productResponse.json();
            console.log('✅ Sucesso!');
            console.log(`   📦 Produto: ${productData.product.name}`);
            console.log(`   🏭 Fabricante: ${productData.product.manufacturer}`);
            console.log(`   💰 Preço: ${productData.product.price || 'N/A'}`);
        } else if (productResponse.status === 404) {
            console.log('ℹ️ Produto não encontrado (esperado se ID não existir)');
        } else {
            console.log('❌ Falhou:', productResponse.status, productResponse.statusText);
        }
        console.log('');

        // 5. Testar busca
        console.log('5️⃣ Testando GET /store/catalog/search?q=microinversor');
        const searchResponse = await fetch(`${baseUrl}/store/catalog/search?q=microinversor`);
        if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            console.log('✅ Sucesso!');
            console.log(`   🔍 ${searchData.total} resultados para "microinversor"`);
            if (searchData.products.length > 0) {
                console.log(`   📋 Primeiro resultado: ${searchData.products[0].name}`);
            }
        } else {
            console.log('❌ Falhou:', searchResponse.status, searchResponse.statusText);
        }
        console.log('');

        // 6. Testar filtros
        console.log('6️⃣ Testando GET /store/catalog/inverters?manufacturer=DEYE&limit=3');
        const filteredResponse = await fetch(`${baseUrl}/store/catalog/inverters?manufacturer=DEYE&limit=3`);
        if (filteredResponse.ok) {
            const filteredData = await filteredResponse.json();
            console.log('✅ Sucesso!');
            console.log(`   🔌 ${filteredData.total} inversores DEYE encontrados`);
        } else {
            console.log('❌ Falhou:', filteredResponse.status, filteredResponse.statusText);
        }

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }

    console.log('\n🎉 Testes concluídos!');
}

// Executar apenas se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    testCatalogAPIs();
}

export { testCatalogAPIs };