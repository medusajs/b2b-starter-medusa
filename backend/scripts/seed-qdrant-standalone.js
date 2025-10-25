/**
 * Script standalone para popular collections Qdrant
 * Não depende do Medusa, faz requisições HTTP diretas
 * 
 * Uso: node seed-qdrant-standalone.js
 */

const https = require('https');
const http = require('http');

// Configurações
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || 'qdrant_dev_key_foss_2025';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MEDUSA_URL = process.env.MEDUSA_URL || 'http://localhost:9000';

if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
}

// Funções auxiliares
function makeRequest(url, options = {}, postData = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;

        const req = protocol.request(url, options, (res) => {
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

async function getEmbedding(text) {
    const response = await makeRequest(
        'https://api.openai.com/v1/embeddings',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
        },
        {
            model: 'text-embedding-3-large',
            input: text,
            dimensions: 3072,
        }
    );

    if (response.statusCode !== 200) {
        throw new Error(`OpenAI error: ${JSON.stringify(response.body)}`);
    }

    return response.body.data[0].embedding;
}

async function upsertToQdrant(collectionName, points) {
    const response = await makeRequest(
        `${QDRANT_URL}/collections/${collectionName}/points`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'api-key': QDRANT_API_KEY,
            },
        },
        {
            points,
            wait: true,
        }
    );

    if (response.statusCode !== 200) {
        throw new Error(`Qdrant error: ${JSON.stringify(response.body)}`);
    }

    return response.body;
}

async function getMedusaProducts() {
    const response = await makeRequest(
        `${MEDUSA_URL}/store/products?limit=20`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );

    if (response.statusCode !== 200) {
        throw new Error(`Medusa error: ${JSON.stringify(response.body)}`);
    }

    return response.body.products || [];
}

async function main() {
    console.log('🚀 Iniciando seed de collections Qdrant...\n');

    try {
        // 1. Usar dados de exemplo para produtos solares
        console.log('📦 Usando dados de exemplo de produtos solares...\n');

        const sampleProducts = [
            {
                id: 1,
                title: 'Painel Solar 550W Monocristalino',
                description: 'Painel fotovoltaico monocristalino de alta eficiência 550W, ideal para sistemas residenciais e comerciais.',
                handle: 'painel-solar-550w-mono',
            },
            {
                id: 2,
                title: 'Inversor Híbrido 5kW',
                description: 'Inversor híbrido on-grid com backup de bateria, potência 5kW, compatível com baterias de lítio.',
                handle: 'inversor-hibrido-5kw',
            },
            {
                id: 3,
                title: 'Kit Solar Residencial 5.5kWp',
                description: 'Kit completo para geração de energia solar residencial, inclui 10 painéis 550W, inversor 5kW e estrutura de fixação.',
                handle: 'kit-solar-residencial-5-5kwp',
            },
            {
                id: 4,
                title: 'Bateria de Lítio 10kWh',
                description: 'Bateria de lítio LiFePO4 para armazenamento de energia, capacidade 10kWh, ciclos de vida 6000+.',
                handle: 'bateria-litio-10kwh',
            },
            {
                id: 5,
                title: 'Estrutura de Fixação para Telhado Colonial',
                description: 'Estrutura em alumínio anodizado para fixação de painéis solares em telhado colonial, suporta até 12 painéis.',
                handle: 'estrutura-telhado-colonial',
            },
            {
                id: 6,
                title: 'Cabo Solar 6mm² Preto - Rolo 100m',
                description: 'Cabo fotovoltaico 6mm² com isolamento duplo, resistente a UV e intempéries, rolo de 100 metros.',
                handle: 'cabo-solar-6mm-preto-100m',
            },
            {
                id: 7,
                title: 'Conector MC4 Par Macho e Fêmea',
                description: 'Conectores MC4 para instalação de painéis solares, IP67, suporta até 30A.',
                handle: 'conector-mc4-par',
            },
            {
                id: 8,
                title: 'String Box CC 2 Entradas',
                description: 'String box DC com 2 entradas, proteção contra surtos, DPS e fusíveis, grau de proteção IP65.',
                handle: 'string-box-cc-2-entradas',
            },
            {
                id: 9,
                title: 'Inversor On-Grid 10kW Trifásico',
                description: 'Inversor on-grid trifásico 10kW, eficiência 98.5%, monitoramento via WiFi, garantia 10 anos.',
                handle: 'inversor-on-grid-10kw-trifasico',
            },
            {
                id: 10,
                title: 'Kit Carregador Veículo Elétrico 7.4kW',
                description: 'Carregador wallbox para veículos elétricos, potência 7.4kW, conector tipo 2, compatível com energia solar.',
                handle: 'kit-carregador-ve-7-4kw',
            },
        ];

        // 2. Popular ysh-catalog
        console.log('🔄 Gerando embeddings e populando ysh-catalog...');
        const catalogPoints = [];

        for (const product of sampleProducts) {
            try {
                console.log(`   Processando: ${product.title}`);

                const text = [
                    product.title,
                    product.description,
                    `Handle: ${product.handle}`,
                ].join('\n');

                const embedding = await getEmbedding(text);

                catalogPoints.push({
                    id: product.id,
                    vector: embedding,
                    payload: {
                        title: product.title,
                        description: product.description,
                        handle: product.handle,
                        created_at: new Date().toISOString(),
                    },
                });

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 600));

            } catch (error) {
                console.error(`   ❌ Erro ao processar ${product.title}:`, error.message);
            }
        }

        if (catalogPoints.length > 0) {
            await upsertToQdrant('ysh-catalog', catalogPoints);
            console.log(`✅ ysh-catalog: ${catalogPoints.length} produtos inseridos\n`);
        }        // 3. Popular ysh-regulations
        console.log('📜 Populando ysh-regulations...');
        const regulations = [
            {
                id: 101,
                title: 'REN 482/2012 - Geração Distribuída',
                content: 'Regulamentação da ANEEL sobre micro e minigeração distribuída de energia elétrica. Estabelece requisitos para conexão à rede e compensação de energia.',
            },
            {
                id: 102,
                title: 'REN 687/2015 - Atualização da GD',
                content: 'Atualização das regras de geração distribuída, incluindo múltiplas unidades consumidoras, geração compartilhada e autoconsumo remoto.',
            },
            {
                id: 103,
                title: 'Lei 14.300/2022 - Marco Legal da GD',
                content: 'Marco legal da geração distribuída no Brasil, estabelecendo regras de transição tarifária e garantindo direitos dos consumidores.',
            },
        ];

        const regPoints = [];
        for (const doc of regulations) {
            const text = `${doc.title}\n${doc.content}`;
            const embedding = await getEmbedding(text);

            regPoints.push({
                id: doc.id,
                vector: embedding,
                payload: {
                    title: doc.title,
                    content: doc.content,
                    created_at: new Date().toISOString(),
                },
            });

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        await upsertToQdrant('ysh-regulations', regPoints);
        console.log(`✅ ysh-regulations: ${regPoints.length} documentos inseridos\n`);

        // 4. Popular ysh-tariffs
        console.log('⚡ Populando ysh-tariffs...');
        const tariffs = [
            {
                id: 201,
                title: 'Tarifa Convencional Residencial',
                content: 'Tarifa aplicada a consumidores residenciais sem horário diferenciado. Cobrada de forma fixa independente do horário de consumo.',
            },
            {
                id: 202,
                title: 'Tarifa Branca',
                content: 'Modalidade tarifária com valores diferenciados por horário de consumo: ponta (mais cara), intermediária e fora de ponta (mais barata).',
            },
            {
                id: 203,
                title: 'Bandeiras Tarifárias',
                content: 'Sistema de sinalização dos custos de geração de energia: verde (sem acréscimo), amarela (acréscimo moderado) e vermelha (acréscimo alto).',
            },
        ];

        const tariffPoints = [];
        for (const doc of tariffs) {
            const text = `${doc.title}\n${doc.content}`;
            const embedding = await getEmbedding(text);

            tariffPoints.push({
                id: doc.id,
                vector: embedding,
                payload: {
                    title: doc.title,
                    content: doc.content,
                    created_at: new Date().toISOString(),
                },
            });

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        await upsertToQdrant('ysh-tariffs', tariffPoints);
        console.log(`✅ ysh-tariffs: ${tariffPoints.length} documentos inseridos\n`);

        // 5. Popular ysh-technical
        console.log('🔧 Populando ysh-technical...');
        const technical = [
            {
                id: 301,
                title: 'Dimensionamento de Sistema Fotovoltaico',
                content: 'Guia para cálculo de potência necessária baseado em consumo mensal e irradiação solar local. Inclui fatores de perda e margem de segurança.',
            },
            {
                id: 302,
                title: 'Instalação de Inversores',
                content: 'Procedimentos de instalação e configuração de inversores on-grid e híbridos. Requer atenção a aterramento, proteções e ventilação adequada.',
            },
            {
                id: 303,
                title: 'Manutenção Preventiva de Painéis',
                content: 'Rotinas de limpeza e inspeção de painéis solares para máxima eficiência. Recomenda-se limpeza trimestral e inspeção anual.',
            },
        ];

        const techPoints = [];
        for (const doc of technical) {
            const text = `${doc.title}\n${doc.content}`;
            const embedding = await getEmbedding(text);

            techPoints.push({
                id: doc.id,
                vector: embedding,
                payload: {
                    title: doc.title,
                    content: doc.content,
                    created_at: new Date().toISOString(),
                },
            });

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        await upsertToQdrant('ysh-technical', techPoints);
        console.log(`✅ ysh-technical: ${techPoints.length} documentos inseridos\n`);

        // 6. Verificar estatísticas finais
        console.log('📊 Estatísticas finais:');
        const collections = ['ysh-catalog', 'ysh-regulations', 'ysh-tariffs', 'ysh-technical'];

        for (const collectionName of collections) {
            const response = await makeRequest(
                `${QDRANT_URL}/collections/${collectionName}`,
                {
                    method: 'GET',
                    headers: {
                        'api-key': QDRANT_API_KEY,
                    },
                }
            );

            if (response.statusCode === 200) {
                const count = response.body.result.points_count || 0;
                console.log(`   ${collectionName}: ${count} pontos`);
            }
        }

        console.log('\n🎉 Seed concluído com sucesso!');
        console.log('✅ Sistema RAG pronto para uso!');

    } catch (error) {
        console.error('\n❌ Erro durante o seed:', error.message);
        process.exit(1);
    }
}

main();
