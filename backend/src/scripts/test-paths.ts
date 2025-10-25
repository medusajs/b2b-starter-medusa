import fs from 'fs';
import path from 'path';

function testCatalogPaths() {
    console.log('🧪 Testando caminhos do catálogo YSH...');

    try {
        const catalogPath = 'c:\\Users\\fjuni\\ysh_medusa\\data\\catalog';
        console.log('📁 Caminho do catálogo:', catalogPath);

        if (!fs.existsSync(catalogPath)) {
            console.error('❌ Diretório do catálogo não encontrado');
            return;
        }

        console.log('✅ Diretório do catálogo encontrado');

        const files = fs.readdirSync(catalogPath);
        console.log('📋 Arquivos encontrados:', files.length);

        // Testar leitura de um arquivo específico
        const panelsPath = path.join(catalogPath, 'panels.json');
        if (fs.existsSync(panelsPath)) {
            const data = fs.readFileSync(panelsPath, 'utf-8');
            const parsed = JSON.parse(data);
            const products = Array.isArray(parsed) ? parsed : parsed.panels || [];
            console.log(`✅ Painéis carregados: ${products.length} produtos`);
            if (products.length > 0) {
                console.log('📦 Primeiro produto:', products[0].name);
            }
        } else {
            console.error('❌ Arquivo panels.json não encontrado');
        }

        console.log('🎉 Caminhos estão funcionando corretamente!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testCatalogPaths();