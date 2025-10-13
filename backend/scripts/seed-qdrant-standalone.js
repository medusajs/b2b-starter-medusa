/**
 * Script standalone para popular collections Qdrant
 * Não depende do Medusa, faz requisições HTTP diretas
 * 
 * Uso: node seed-qdrant-standalone.js
 */

const https = require('https');
const http = require('http');

// Configurações
const QDRANT_URL = 'http://localhost:6333';
const QDRANT_API_KEY = 'qdrant_dev_key_foss_2025';
const OPENAI_API_KEY = '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';
const MEDUSA_URL = 'http://localhost:9000';

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
    // 1. Buscar produtos do Medusa
    console.log('📦 Buscando produtos do Medusa...');
    const products = await getMedusaProducts();
    console.log(`✅ ${products.length} produtos encontrados\n`);
    
    if (products.length === 0) {
      console.log('⚠️  Nenhum produto encontrado. Execute o seed do Medusa primeiro.');
      return;
    }
    
    // 2. Popular ysh-catalog
    console.log('🔄 Gerando embeddings e populando ysh-catalog...');
    const catalogPoints = [];
    
    for (let i = 0; i < Math.min(products.length, 10); i++) {
      const product = products[i];
      
      try {
        console.log(`   Processando: ${product.title}`);
        
        const text = [
          product.title,
          product.description || '',
          `Handle: ${product.handle}`,
        ].join('\n');
        
        const embedding = await getEmbedding(text);
        
        catalogPoints.push({
          id: product.id,
          vector: embedding,
          payload: {
            title: product.title,
            description: product.description || '',
            handle: product.handle,
            created_at: new Date().toISOString(),
          },
        });
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`   ❌ Erro ao processar ${product.title}:`, error.message);
      }
    }
    
    if (catalogPoints.length > 0) {
      await upsertToQdrant('ysh-catalog', catalogPoints);
      console.log(`✅ ysh-catalog: ${catalogPoints.length} produtos inseridos\n`);
    }
    
    // 3. Popular ysh-regulations
    console.log('📜 Populando ysh-regulations...');
    const regulations = [
      {
        id: 'reg-001',
        title: 'REN 482/2012 - Geração Distribuída',
        content: 'Regulamentação da ANEEL sobre micro e minigeração distribuída de energia elétrica. Estabelece requisitos para conexão à rede e compensação de energia.',
      },
      {
        id: 'reg-002',
        title: 'REN 687/2015 - Atualização da GD',
        content: 'Atualização das regras de geração distribuída, incluindo múltiplas unidades consumidoras, geração compartilhada e autoconsumo remoto.',
      },
      {
        id: 'reg-003',
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
        id: 'tariff-001',
        title: 'Tarifa Convencional Residencial',
        content: 'Tarifa aplicada a consumidores residenciais sem horário diferenciado. Cobrada de forma fixa independente do horário de consumo.',
      },
      {
        id: 'tariff-002',
        title: 'Tarifa Branca',
        content: 'Modalidade tarifária com valores diferenciados por horário de consumo: ponta (mais cara), intermediária e fora de ponta (mais barata).',
      },
      {
        id: 'tariff-003',
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
        id: 'tech-001',
        title: 'Dimensionamento de Sistema Fotovoltaico',
        content: 'Guia para cálculo de potência necessária baseado em consumo mensal e irradiação solar local. Inclui fatores de perda e margem de segurança.',
      },
      {
        id: 'tech-002',
        title: 'Instalação de Inversores',
        content: 'Procedimentos de instalação e configuração de inversores on-grid e híbridos. Requer atenção a aterramento, proteções e ventilação adequada.',
      },
      {
        id: 'tech-003',
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
