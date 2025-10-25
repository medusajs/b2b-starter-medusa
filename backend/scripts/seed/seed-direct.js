/**
 * Script direto para seed do catálogo via HTTP
 */

const fs = require('fs');
const path = require('path');

async function seedCatalog() {
    console.log("🌱 Iniciando seed do catálogo YSH via Node.js direto...\n");

    const catalogDir = path.join(__dirname, "src", "data", "catalog", "unified_schemas");

    if (!fs.existsSync(catalogDir)) {
        throw new Error(`Diretório não encontrado: ${catalogDir}`);
    }

    const files = fs.readdirSync(catalogDir)
        .filter(f => f.endsWith("_unified.json") && !f.includes("backup"));

    console.log(`📄 Encontrados ${files.length} arquivos\n`);

    let totalProducts = 0;

    for (const file of files) {
        const filePath = path.join(catalogDir, file);
        const products = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const category = file.replace("_unified.json", "");

        console.log(`📦 ${category}: ${products.length} produtos`);
        totalProducts += products.length;

        // Mostrar exemplo de imagem
        if (products.length > 0) {
            const sample = products[0];
            console.log(`   Exemplo: ${sample.name}`);
            console.log(`   Imagem: ${sample.image_url || 'N/A'}`);
        }
    }

    console.log(`\n✅ Total: ${totalProducts} produtos prontos para seed`);
    console.log("\n💡 Para fazer o seed completo, use:");
    console.log("   npm run seed:catalog-integrated\n");
}

seedCatalog().catch(console.error);
