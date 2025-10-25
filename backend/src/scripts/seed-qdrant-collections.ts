import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, ModuleRegistrationName } from "@medusajs/framework/utils";
import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";

/**
 * Script para popular collections Qdrant com embeddings de produtos
 * 
 * Uso:
 * docker exec ysh-b2b-backend yarn medusa exec ./src/scripts/seed-qdrant-collections.ts
 * 
 * Collections populadas:
 * - ysh-catalog: Produtos e SKUs do catálogo
 * - ysh-regulations: Documentação de regulamentações (placeholder)
 * - ysh-tariffs: Tarifas ANEEL (placeholder)
 * - ysh-technical: Documentação técnica (placeholder)
 */
export default async function seedQdrantCollections({ container }: ExecArgs): Promise<void> {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    logger.info("🚀 Iniciando seed de collections Qdrant...");

    // Verificar variáveis de ambiente
    const qdrantUrl = process.env.QDRANT_URL;
    const qdrantApiKey = process.env.QDRANT_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!qdrantUrl || !qdrantApiKey || !openaiApiKey) {
        logger.error("❌ Variáveis de ambiente não configuradas:");
        logger.error(`QDRANT_URL: ${qdrantUrl ? "✅" : "❌"}`);
        logger.error(`QDRANT_API_KEY: ${qdrantApiKey ? "✅" : "❌"}`);
        logger.error(`OPENAI_API_KEY: ${openaiApiKey ? "✅" : "❌"}`);
        throw new Error("Missing required environment variables");
    }

    // Inicializar clientes
    const qdrant = new QdrantClient({
        url: qdrantUrl,
        apiKey: qdrantApiKey,
    });

    const openai = new OpenAI({
        apiKey: openaiApiKey,
    });

    logger.info("✅ Clientes Qdrant e OpenAI inicializados");

    // Verificar health do Qdrant
    try {
        const health = await qdrant.api("cluster").health();
        logger.info(`✅ Qdrant health check: ${JSON.stringify(health)}`);
    } catch (error) {
        logger.error("❌ Erro ao conectar no Qdrant:", error);
        throw error;
    }

    // Resolver serviços Medusa
    const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    // 1. Popular ysh-catalog com produtos
    logger.info("📦 Buscando produtos do Medusa...");

    try {
        const { data: products } = await query.graph({
            entity: "products",
            fields: ["id", "title", "description", "handle", "metadata", "variants.*"],
            filters: {},
        });

        logger.info(`📊 ${products.length} produtos encontrados`);

        if (products.length === 0) {
            logger.warn("⚠️  Nenhum produto encontrado. Execute o seed principal primeiro:");
            logger.warn("   docker exec ysh-b2b-backend yarn run seed");
            return;
        }

        // Processar em batches para evitar rate limit da OpenAI
        const batchSize = 10;
        let processedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);

            logger.info(`🔄 Processando batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}...`);

            const points: any[] = [];

            for (const product of batch) {
                try {
                    // Criar texto para embedding
                    const variants = product.variants || [];
                    const variantInfo = variants.map((v: any) =>
                        `SKU: ${v.sku || 'N/A'}, Título: ${v.title || product.title}`
                    ).join('; ');

                    const text = [
                        product.title,
                        product.description || '',
                        `Handle: ${product.handle}`,
                        variantInfo,
                        product.metadata?.manufacturer ? `Fabricante: ${product.metadata.manufacturer}` : '',
                        product.metadata?.category ? `Categoria: ${product.metadata.category}` : '',
                    ].filter(Boolean).join('\n');

                    // Gerar embedding via OpenAI
                    const response = await openai.embeddings.create({
                        model: "text-embedding-3-large",
                        input: text,
                        dimensions: 3072,
                    });

                    const embedding = response.data[0].embedding;

                    // Preparar ponto para Qdrant
                    points.push({
                        id: product.id,
                        vector: embedding,
                        payload: {
                            title: product.title,
                            description: product.description || '',
                            handle: product.handle,
                            metadata: product.metadata || {},
                            variants_count: variants.length,
                            created_at: new Date().toISOString(),
                        },
                    });

                    processedCount++;
                } catch (error) {
                    logger.error(`❌ Erro ao processar produto ${product.id}:`, error);
                    errorCount++;
                }
            }

            // Inserir batch no Qdrant
            if (points.length > 0) {
                try {
                    await qdrant.upsert("ysh-catalog", {
                        points,
                        wait: true,
                    });

                    logger.info(`✅ Batch inserido: ${points.length} produtos`);
                } catch (error) {
                    logger.error("❌ Erro ao inserir batch no Qdrant:", error);
                    errorCount += points.length;
                }
            }

            // Rate limiting: aguardar entre batches
            if (i + batchSize < products.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        logger.info(`✅ Collection ysh-catalog populada: ${processedCount} produtos`);

        if (errorCount > 0) {
            logger.warn(`⚠️  ${errorCount} produtos com erro`);
        }

        // Verificar collection
        const collectionInfo = await qdrant.getCollection("ysh-catalog");
        logger.info(`📊 ysh-catalog stats: ${JSON.stringify(collectionInfo.points_count)} pontos`);

    } catch (error) {
        logger.error("❌ Erro ao popular ysh-catalog:", error);
        throw error;
    }

    // 2. Popular ysh-regulations (placeholder)
    logger.info("📜 Populando ysh-regulations com documentação de regulamentações...");

    try {
        const regulationDocs = [
            {
                id: "reg-001",
                title: "REN 482/2012 - Geração Distribuída",
                content: "Regulamentação da ANEEL sobre micro e minigeração distribuída de energia elétrica.",
                category: "geracao-distribuida",
            },
            {
                id: "reg-002",
                title: "REN 687/2015 - Atualização da GD",
                content: "Atualização das regras de geração distribuída, incluindo múltiplas unidades consumidoras.",
                category: "geracao-distribuida",
            },
            {
                id: "reg-003",
                title: "Lei 14.300/2022 - Marco Legal da GD",
                content: "Marco legal da geração distribuída no Brasil, estabelecendo regras de transição tarifária.",
                category: "legislacao",
            },
        ];

        const regPoints: any[] = [];

        for (const doc of regulationDocs) {
            const text = `${doc.title}\n${doc.content}\nCategoria: ${doc.category}`;

            const response = await openai.embeddings.create({
                model: "text-embedding-3-large",
                input: text,
                dimensions: 3072,
            });

            regPoints.push({
                id: doc.id,
                vector: response.data[0].embedding,
                payload: {
                    title: doc.title,
                    content: doc.content,
                    category: doc.category,
                    created_at: new Date().toISOString(),
                },
            });
        }

        await qdrant.upsert("ysh-regulations", {
            points: regPoints,
            wait: true,
        });

        logger.info(`✅ Collection ysh-regulations populada: ${regPoints.length} documentos`);

    } catch (error) {
        logger.error("❌ Erro ao popular ysh-regulations:", error);
    }

    // 3. Popular ysh-tariffs (placeholder)
    logger.info("⚡ Populando ysh-tariffs com informações de tarifas...");

    try {
        const tariffDocs = [
            {
                id: "tariff-001",
                title: "Tarifa Convencional Residencial",
                content: "Tarifa aplicada a consumidores residenciais sem horário diferenciado.",
                type: "convencional",
            },
            {
                id: "tariff-002",
                title: "Tarifa Branca",
                content: "Modalidade tarifária com valores diferenciados por horário de consumo.",
                type: "branca",
            },
            {
                id: "tariff-003",
                title: "Bandeiras Tarifárias",
                content: "Sistema de sinalização dos custos de geração de energia: verde, amarela e vermelha.",
                type: "bandeiras",
            },
        ];

        const tariffPoints: any[] = [];

        for (const doc of tariffDocs) {
            const text = `${doc.title}\n${doc.content}\nTipo: ${doc.type}`;

            const response = await openai.embeddings.create({
                model: "text-embedding-3-large",
                input: text,
                dimensions: 3072,
            });

            tariffPoints.push({
                id: doc.id,
                vector: response.data[0].embedding,
                payload: {
                    title: doc.title,
                    content: doc.content,
                    type: doc.type,
                    created_at: new Date().toISOString(),
                },
            });
        }

        await qdrant.upsert("ysh-tariffs", {
            points: tariffPoints,
            wait: true,
        });

        logger.info(`✅ Collection ysh-tariffs populada: ${tariffPoints.length} documentos`);

    } catch (error) {
        logger.error("❌ Erro ao popular ysh-tariffs:", error);
    }

    // 4. Popular ysh-technical (placeholder)
    logger.info("🔧 Populando ysh-technical com documentação técnica...");

    try {
        const technicalDocs = [
            {
                id: "tech-001",
                title: "Dimensionamento de Sistema Fotovoltaico",
                content: "Guia para cálculo de potência necessária baseado em consumo mensal e irradiação solar.",
                category: "dimensionamento",
            },
            {
                id: "tech-002",
                title: "Instalação de Inversores",
                content: "Procedimentos de instalação e configuração de inversores on-grid e híbridos.",
                category: "instalacao",
            },
            {
                id: "tech-003",
                title: "Manutenção Preventiva de Painéis",
                content: "Rotinas de limpeza e inspeção de painéis solares para máxima eficiência.",
                category: "manutencao",
            },
        ];

        const techPoints: any[] = [];

        for (const doc of technicalDocs) {
            const text = `${doc.title}\n${doc.content}\nCategoria: ${doc.category}`;

            const response = await openai.embeddings.create({
                model: "text-embedding-3-large",
                input: text,
                dimensions: 3072,
            });

            techPoints.push({
                id: doc.id,
                vector: response.data[0].embedding,
                payload: {
                    title: doc.title,
                    content: doc.content,
                    category: doc.category,
                    created_at: new Date().toISOString(),
                },
            });
        }

        await qdrant.upsert("ysh-technical", {
            points: techPoints,
            wait: true,
        });

        logger.info(`✅ Collection ysh-technical populada: ${techPoints.length} documentos`);

    } catch (error) {
        logger.error("❌ Erro ao popular ysh-technical:", error);
    }

    // Resumo final
    logger.info("🎉 Seed de collections Qdrant concluído!");
    logger.info("📊 Resumo:");

    try {
        const collections = ["ysh-catalog", "ysh-regulations", "ysh-tariffs", "ysh-technical"];

        for (const collectionName of collections) {
            const info = await qdrant.getCollection(collectionName);
            logger.info(`   ${collectionName}: ${info.points_count} pontos`);
        }
    } catch (error) {
        logger.error("❌ Erro ao buscar estatísticas:", error);
    }

    logger.info("✅ Sistema RAG pronto para uso!");
}
