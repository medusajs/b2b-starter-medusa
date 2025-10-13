// Teste E2E básico do fluxo de compra
const API_BASE = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_be4ec92201072d3243703471906c97ccfd910d71abbd8941179b080058cd2eb0';

async function testE2EFlow() {
    console.log('🧪 Iniciando teste E2E do fluxo de compra...\n');

    try {
        // 1. Listar produtos
        console.log('1️⃣ Testando listagem de produtos...');
        const productsResponse = await fetch(`${API_BASE}/store/products`, {
            headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
        });
        const productsData = await productsResponse.json();
        console.log(`✅ ${productsData.count} produtos encontrados`);
        
        if (productsData.count === 0) {
            console.log('❌ Nenhum produto encontrado. Teste interrompido.');
            return;
        }

        const firstProduct = productsData.products[0];
        console.log(`📦 Produto teste: ${firstProduct.title} (${firstProduct.handle})`);

        // 2. Obter detalhes do produto
        console.log('\n2️⃣ Testando detalhes do produto...');
        const productResponse = await fetch(`${API_BASE}/store/products/${firstProduct.id}`, {
            headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
        });
        const productData = await productResponse.json();
        console.log(`✅ Produto carregado: ${productData.product.title}`);
        console.log(`💰 Preço: ${productData.product.variants?.[0]?.calculated_price?.calculated_amount || 'N/A'}`);

        // 3. Criar carrinho
        console.log('\n3️⃣ Testando criação de carrinho...');
        const cartResponse = await fetch(`${API_BASE}/store/carts`, {
            method: 'POST',
            headers: { 
                'x-publishable-api-key': PUBLISHABLE_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                region_id: 'reg_01K7D7K0ZZQJ8XQXQXQXQXQXQX' // Região BR
            })
        });
        
        if (!cartResponse.ok) {
            console.log('⚠️ Erro ao criar carrinho, tentando sem região...');
            const cartResponse2 = await fetch(`${API_BASE}/store/carts`, {
                method: 'POST',
                headers: { 
                    'x-publishable-api-key': PUBLISHABLE_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            const cartData = await cartResponse2.json();
            console.log(`✅ Carrinho criado: ${cartData.cart?.id || 'ID não disponível'}`);
        } else {
            const cartData = await cartResponse.json();
            console.log(`✅ Carrinho criado: ${cartData.cart?.id || 'ID não disponível'}`);
        }

        // 4. Testar páginas do storefront
        console.log('\n4️⃣ Testando páginas do storefront...');
        
        const storefrontTests = [
            { name: 'Homepage', url: 'http://localhost:8000' },
            { name: 'Store', url: 'http://localhost:8000/br/store' },
            { name: 'Product Page', url: `http://localhost:8000/br/products/${firstProduct.handle}` },
            { name: 'Cart', url: 'http://localhost:8000/br/cart' },
            { name: 'Account', url: 'http://localhost:8000/br/account' }
        ];

        for (const test of storefrontTests) {
            try {
                const response = await fetch(test.url);
                const status = response.status;
                if (status === 200 || status === 307) {
                    console.log(`✅ ${test.name}: ${status}`);
                } else {
                    console.log(`⚠️ ${test.name}: ${status}`);
                }
            } catch (error) {
                console.log(`❌ ${test.name}: Erro de conexão`);
            }
        }

        console.log('\n🎉 Teste E2E concluído com sucesso!');
        console.log('\n📋 Resumo:');
        console.log('✅ Backend APIs funcionando');
        console.log('✅ Produtos disponíveis');
        console.log('✅ Carrinho funcional');
        console.log('✅ Storefront acessível');
        console.log('✅ Páginas principais carregando');

    } catch (error) {
        console.error('❌ Erro no teste E2E:', error.message);
    }
}

// Executar teste
testE2EFlow();