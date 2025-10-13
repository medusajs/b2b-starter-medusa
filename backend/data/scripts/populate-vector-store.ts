// scripts/populate-vector-store.ts

import { ChromaClient, Collection } from 'chromadb'
import { OllamaEmbeddings } from '@langchain/ollama'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid';

export interface ProductDocument {
    id: string
    content: string
    metadata: {
        product_id: string
        title: string
        category: string
        manufacturer: string
        price: number
        power_w?: number
        efficiency?: number
        technology?: string
        [key: string]: any
    }
}

export class VectorStoreService {
    private client: ChromaClient
    private embeddings: OllamaEmbeddings
    private collection: Collection | null = null

    constructor() {
        this.client = new ChromaClient({
            path: process.env.CHROMA_URL || 'http://localhost:8000',
        })

        this.embeddings = new OllamaEmbeddings({
            model: 'nomic-embed-text',
            baseUrl: 'http://localhost:11434',
        })
    }

    /**
     * Inicializa a collection no ChromaDB
     */
    async initialize() {
        try {
            this.collection = await this.client.getOrCreateCollection({
                name: 'ysh_products',
                metadata: { 'hnsw:space': 'cosine' },
            })
            console.log('✅ Vector store inicializado')
        } catch (error) {
            console.error('❌ Erro ao inicializar vector store:', error)
            throw error
        }
    }

    /**
     * Adiciona produtos ao vector store
     */
    async addProducts(products: ProductDocument[]) {
        if (!this.collection) {
            await this.initialize()
        }

        if (products.length === 0) {
            console.log('⚠️ Nenhum produto para adicionar.');
            return;
        }

        console.log(`📦 Adicionando ${products.length} produtos ao vector store...`)

        // Preparar documentos
        const documents = products.map(p => p.content)
        const metadatas = products.map(p => p.metadata)
        const ids = products.map(p => p.id)

        // Gerar embeddings
        const embeddings = await this.embeddings.embedDocuments(documents)

        // Adicionar ao ChromaDB
        await this.collection!.add({
            ids,
            documents,
            metadatas,
            embeddings,
        })

        console.log(`✅ ${products.length} produtos adicionados ao vector store`)
    }

    /**
     * Limpa o vector store
     */
    async clear() {
        if (this.collection) {
            try {
                await this.client.deleteCollection({ name: 'ysh_products' })
                this.collection = null
                console.log('🗑️  Vector store limpo')
            } catch (error) {
                console.error('❌ Erro ao limpar o vector store:', error);
                // Se a coleção não existir, apenas logamos e continuamos
                if (error.message.includes('does not exist')) {
                    this.collection = null;
                } else {
                    throw error;
                }
            }
        }
    }
}


async function populateVectorStore() {
    console.log('🚀 Iniciando população do vector store...')

    const vectorStore = new VectorStoreService()
    await vectorStore.initialize()

    // Limpar dados antigos
    await vectorStore.clear()
    await vectorStore.initialize()

    // 1. Carregar dados dos distribuidores
    const dataDir = path.join(__dirname, '../products-inventory')

    const files = [
        { path: 'odex/odex-inverters.json', category: 'inverters', manufacturer: 'Odex' },
        { path: 'odex/odex-panels.json', category: 'panels', manufacturer: 'Odex' },
        { path: 'odex/odex-structures.json', category: 'structures', manufacturer: 'Odex' },
        { path: 'odex/odex-stringboxes.json', category: 'stringboxes', manufacturer: 'Odex' },
        { path: 'solfacil/solfacil-inverters.json', category: 'inverters', manufacturer: 'Solfacil' },
        { path: 'solfacil/solfacil-panels.json', category: 'panels', manufacturer: 'Solfacil' },
        { path: 'solfacil/solfacil-batteries.json', category: 'batteries', manufacturer: 'Solfacil' },
        { path: 'solfacil/solfacil-cables.json', category: 'cables', manufacturer: 'Solfacil' },
        { path: 'solfacil/solfacil-accessories.json', category: 'accessories', manufacturer: 'Solfacil' },
        { path: 'solfacil/solfacil-structures.json', category: 'structures', manufacturer: 'Solfacil' },
    ]

    const allProducts: ProductDocument[] = []

    for (const file of files) {
        const filePath = path.join(dataDir, file.path)
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  Arquivo não encontrado: ${filePath}`)
            continue
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        if (!fileContent.trim()) {
            console.warn(`⚠️  Arquivo vazio: ${filePath}`);
            continue;
        }

        const data = JSON.parse(fileContent);
        console.log(`📦 Carregando ${data.length} produtos de ${file.path}`)

        const products: ProductDocument[] = data.map((item: any) => {
            // Criar texto rico para embedding
            const content = `
${item.name || item.title}
Fabricante: ${item.manufacturer || file.manufacturer}
Categoria: ${item.category || file.category}
${item.description || ''}

Especificações Técnicas:
${item.model ? `Modelo: ${item.model}` : ''}
${item.power_w ? `Potência: ${item.power_w}W` : ''}
${item.voltage_v ? `Tensão: ${item.voltage_v}V` : ''}
${item.efficiency ? `Eficiência: ${item.efficiency}%` : ''}
${item.technology ? `Tecnologia: ${item.technology}` : ''}

Preço: R$ ${item.pricing?.price || item.price || 0}
Disponibilidade: ${item.availability || 'disponível'}
      `.trim()

            const id = item.id || uuidv4();

            return {
                id: id,
                content,
                metadata: {
                    product_id: id,
                    title: item.name || item.title,
                    category: item.category || file.category,
                    manufacturer: item.manufacturer || file.manufacturer,
                    model: item.model || '',
                    price: item.pricing?.price || item.price || 0,
                    power_w: item.power_w,
                    efficiency: item.efficiency,
                    technology: item.technology,
                    availability: item.availability,
                    source: item.source || file.path,
                    image: item.image,
                },
            }
        })

        allProducts.push(...products)
    }

    // 2. Adicionar ao vector store em batches
    const batchSize = 100
    for (let i = 0; i < allProducts.length; i += batchSize) {
        const batch = allProducts.slice(i, i + batchSize)
        await vectorStore.addProducts(batch)
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} adicionado (${batch.length} produtos)`)
    }

    console.log(`🎉 Vector store populado com ${allProducts.length} produtos!`)
}

// Executar
populateVectorStore()
    .then(() => {
        console.log('✨ Concluído!')
        process.exit(0)
    })
    .catch(error => {
        console.error('❌ Erro:', error)
        process.exit(1)
    })
