#!/usr/bin/env tsx

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

async function startServer() {
    try {
        // Verificar se o catálogo existe
        const catalogPath = 'c:\\Users\\fjuni\\ysh_medusa\\data\\catalog';
        if (!fs.existsSync(catalogPath)) {
            console.error('❌ Diretório do catálogo não encontrado:', catalogPath);
            process.exit(1);
        }

        console.log('✅ Catálogo encontrado');

        // Importar express
        const express = (await import('express')).default;
        const app = express();
        const port = 3000;

        // Middleware para JSON
        app.use(express.json());

        // Função simples para ler arquivos do catálogo
        const readCatalogFile = (fileName: string) => {
            const filePath = path.join(catalogPath, fileName);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Arquivo não encontrado: ${fileName}`);
            }
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        };

        // API Routes
        app.get('/store/catalog', async (req: any, res: any) => {
            try {
                // Simular dados básicos do catálogo
                const categories = [
                    "kits", "panels", "inverters", "cables",
                    "chargers", "controllers", "accessories",
                    "structures", "batteries"
                ];

                // Tentar ler fabricantes de diferentes arquivos
                const manufacturers = new Set<string>();
                for (const category of categories) {
                    try {
                        const data = readCatalogFile(`${category}.json`);
                        if (Array.isArray(data)) {
                            data.forEach((item: any) => {
                                if (item.manufacturer) manufacturers.add(item.manufacturer);
                            });
                        }
                    } catch (e) {
                        // Ignorar erros de arquivo
                    }
                }

                res.json({
                    categories,
                    manufacturers: Array.from(manufacturers),
                    total_categories: categories.length,
                    total_manufacturers: manufacturers.size
                });
            } catch (error: any) {
                res.status(500).json({ error: error.message });
            }
        });

        app.get('/store/catalog/:category', async (req: any, res: any) => {
            try {
                const { category } = req.params;
                const data = readCatalogFile(`${category}.json`);

                if (!Array.isArray(data)) {
                    return res.status(400).json({ error: 'Formato de dados inválido' });
                }

                res.json({ products: data, total: data.length });
            } catch (error: any) {
                res.status(500).json({ error: error.message });
            }
        });

        app.get('/store/catalog/:category/:id', async (req: any, res: any) => {
            try {
                const { category, id } = req.params;
                const data = readCatalogFile(`${category}.json`);

                if (!Array.isArray(data)) {
                    return res.status(400).json({ error: 'Formato de dados inválido' });
                }

                const product = data.find((item: any) => item.id === id || item.id === parseInt(id));

                if (!product) {
                    return res.status(404).json({
                        error: 'Produto não encontrado',
                        message: `Produto ${id} não encontrado na categoria ${category}`
                    });
                }

                res.json({ product });
            } catch (error: any) {
                res.status(500).json({ error: error.message });
            }
        });

        app.get('/store/catalog/search', async (req: any, res: any) => {
            try {
                const { q, category } = req.query;

                if (!q) {
                    return res.status(400).json({ error: 'Parâmetro de busca "q" é obrigatório' });
                }

                const categories = category ? [category] : [
                    "kits", "panels", "inverters", "cables",
                    "chargers", "controllers", "accessories",
                    "structures", "batteries"
                ];

                const results: any[] = [];

                for (const cat of categories) {
                    try {
                        const data = readCatalogFile(`${cat}.json`);
                        if (Array.isArray(data)) {
                            const matches = data.filter((item: any) => {
                                const searchText = q.toLowerCase();
                                return (
                                    (item.name && item.name.toLowerCase().includes(searchText)) ||
                                    (item.description && item.description.toLowerCase().includes(searchText)) ||
                                    (item.manufacturer && item.manufacturer.toLowerCase().includes(searchText))
                                );
                            });
                            results.push(...matches);
                        }
                    } catch (e) {
                        // Ignorar erros de arquivo
                    }
                }

                res.json({ products: results, total: results.length });
            } catch (error: any) {
                res.status(500).json({ error: error.message });
            }
        });

        app.get('/store/catalog/manufacturers', async (req: any, res: any) => {
            try {
                const categories = [
                    "kits", "panels", "inverters", "cables",
                    "chargers", "controllers", "accessories",
                    "structures", "batteries"
                ];

                const manufacturers = new Set<string>();
                for (const category of categories) {
                    try {
                        const data = readCatalogFile(`${category}.json`);
                        if (Array.isArray(data)) {
                            data.forEach((item: any) => {
                                if (item.manufacturer) manufacturers.add(item.manufacturer);
                            });
                        }
                    } catch (e) {
                        // Ignorar erros de arquivo
                    }
                }

                res.json({ manufacturers: Array.from(manufacturers) });
            } catch (error: any) {
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

    } catch (error: any) {
        console.error('❌ Erro ao iniciar servidor:', error.message);
        process.exit(1);
    }
}

startServer();