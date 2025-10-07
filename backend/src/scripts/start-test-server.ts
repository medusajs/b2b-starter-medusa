#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navegar para o diretório correto do backend
const backendDir = path.resolve(__dirname, '../../../');
process.chdir(backendDir);

console.log('🚀 Iniciando servidor de teste do catálogo YSH...');
console.log('📍 Diretório atual:', process.cwd());

try {
    // Verificar se o catálogo existe
    const catalogPath = 'c:\\Users\\fjuni\\ysh_medusa\\data\\catalog';
    if (!fs.existsSync(catalogPath)) {
        console.error('❌ Diretório do catálogo não encontrado:', catalogPath);
        process.exit(1);
    }

    console.log('✅ Catálogo encontrado');

    // Importar e executar o servidor de teste
    const { default: express } = await import('express');
    const app = express();
    const port = 3000;

    // Middleware para JSON
    app.use(express.json());

    // Simular container Medusa
    const mockContainer = {
        resolve: (serviceName: string) => {
            if (serviceName === 'yshCatalog') {
                // Importar dinamicamente o serviço
                const { default: YshCatalogModuleService } = await import('../modules/ysh-catalog/service.js');
                return new YshCatalogModuleService();
            }
            return null;
        }
    };

    // Middleware para adicionar container ao request
    app.use((req, res, next) => {
        req.scope = mockContainer;
        next();
    });

    // API Routes
    app.get('/store/catalog', async (req, res) => {
        try {
            const yshCatalogService = req.scope.resolve('yshCatalog');
            const manufacturers = await yshCatalogService.getManufacturers();

            res.json({
                categories: [
                    "kits",
                    "panels",
                    "inverters",
                    "cables",
                    "chargers",
                    "controllers",
                    "accessories",
                    "structures",
                    "batteries"
                ],
                manufacturers,
                total_categories: 9,
                total_manufacturers: manufacturers.length
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/store/catalog/:category', async (req, res) => {
        try {
            const yshCatalogService = req.scope.resolve('yshCatalog');
            const { category } = req.params;
            const { manufacturer, min_price, max_price, available, limit = 10, offset = 0 } = req.query;

            const filters = {};
            if (manufacturer) filters.manufacturer = manufacturer;
            if (min_price) filters.minPrice = parseFloat(min_price);
            if (max_price) filters.maxPrice = parseFloat(max_price);
            if (available !== undefined) filters.available = available === 'true';

            const products = await yshCatalogService.listProductsByCategory(category, {
                ...filters,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({ products, total: products.length });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/store/catalog/:category/:id', async (req, res) => {
        try {
            const yshCatalogService = req.scope.resolve('yshCatalog');
            const { category, id } = req.params;

            const product = await yshCatalogService.getProductById(category, id);

            if (!product) {
                return res.status(404).json({
                    error: 'Produto não encontrado',
                    message: `Produto ${id} não encontrado na categoria ${category}`
                });
            }

            res.json({ product });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/store/catalog/search', async (req, res) => {
        try {
            const yshCatalogService = req.scope.resolve('yshCatalog');
            const { q, category } = req.query;

            if (!q) {
                return res.status(400).json({ error: 'Parâmetro de busca "q" é obrigatório' });
            }

            const products = await yshCatalogService.searchProducts(q, category);

            res.json({ products, total: products.length });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/store/catalog/manufacturers', async (req, res) => {
        try {
            const yshCatalogService = req.scope.resolve('yshCatalog');
            const manufacturers = await yshCatalogService.getManufacturers();

            res.json({ manufacturers });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.listen(port, () => {
        console.log(`🚀 Servidor de teste YSH Catalog rodando na porta ${port}`);
        console.log(`📋 APIs disponíveis:`);
        console.log(`   GET /store/catalog`);
        console.log(`   GET /store/catalog/:category`);
        console.log(`   GET /store/catalog/:category/:id`);
        console.log(`   GET /store/catalog/search?q=termo`);
        console.log(`   GET /store/catalog/manufacturers`);
        console.log(`\n🎉 Servidor iniciado com sucesso!`);
    });

} catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
}