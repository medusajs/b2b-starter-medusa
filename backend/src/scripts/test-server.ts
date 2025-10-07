import express from 'express';
import YshCatalogModuleService from '../modules/ysh-catalog/service';

const app = express();
const port = 3000;

// Middleware para JSON
app.use(express.json());

// Simular container Medusa
const mockContainer = {
    resolve: (serviceName: string) => {
        if (serviceName === 'yshCatalog') {
            return new YshCatalogModuleService();
        }
        return null;
    }
};

// Middleware para adicionar container ao request
app.use((req: any, res, next) => {
    req.scope = mockContainer;
    next();
});

// API Routes
app.get('/store/catalog', async (req: any, res) => {
    try {
        const yshCatalogService = req.scope.resolve('yshCatalog');
        const categories = await yshCatalogService.getCategories();
        const manufacturers = await yshCatalogService.getManufacturers();

        res.json({
            categories,
            manufacturers,
            total_categories: categories.length,
            total_manufacturers: manufacturers.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/store/catalog/:category', async (req: any, res) => {
    try {
        const yshCatalogService = req.scope.resolve('yshCatalog');
        const { category } = req.params;
        const { manufacturer, min_price, max_price, available, limit = 10, offset = 0 } = req.query;

        const filters: any = {};
        if (manufacturer) filters.manufacturer = manufacturer;
        if (min_price) filters.minPrice = parseFloat(min_price as string);
        if (max_price) filters.maxPrice = parseFloat(max_price as string);
        if (available !== undefined) filters.available = available === 'true';

        const products = await yshCatalogService.listProductsByCategory(category, {
            ...filters,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string)
        });

        res.json({ products, total: products.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/store/catalog/:category/:id', async (req: any, res) => {
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

app.get('/store/catalog/search', async (req: any, res) => {
    try {
        const yshCatalogService = req.scope.resolve('yshCatalog');
        const { q, category } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Parâmetro de busca "q" é obrigatório' });
        }

        const products = await yshCatalogService.searchProducts(q as string, category as string);

        res.json({ products, total: products.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/store/catalog/manufacturers', async (req: any, res) => {
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
});