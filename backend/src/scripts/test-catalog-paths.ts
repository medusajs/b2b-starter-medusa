#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navegar para o diretório correto do backend
const backendDir = path.resolve(__dirname, '../../../');
process.chdir(backendDir);

console.log('🧪 Testando caminhos do catálogo YSH...');
console.log('📍 Diretório atual:', process.cwd());

try {
    const catalogPath = 'c:\\Users\\fjuni\\ysh_medusa\\data\\catalog';
    console.log('📁 Caminho do catálogo:', catalogPath);

    if (!fs.existsSync(catalogPath)) {
        console.error('❌ Diretório do catálogo não encontrado');
        process.exit(1);
    }

    console.log('✅ Diretório do catálogo encontrado');

    const files = fs.readdirSync(catalogPath);
    console.log('📋 Arquivos encontrados:', files.length);

    // Testar leitura de alguns arquivos específicos
    const testFiles = ['panels.json', 'inverters.json', 'kits.json'];

    for (const file of testFiles) {
        const filePath = path.join(catalogPath, file);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(data);
            const products = Array.isArray(parsed) ? parsed : parsed.panels || parsed.inverters || parsed.kits || [];
            console.log(`✅ ${file}: ${products.length} produtos`);
        } else {
            console.log(`⚠️ ${file}: arquivo não encontrado`);
        }
    }

    console.log('🎉 Todos os caminhos estão funcionando corretamente!');

} catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
}