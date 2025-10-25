import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { QdrantClient } from "@qdrant/js-client-rest";

/**
 * POST /admin/rag/seed-collections
 * 
 * Popula collections Qdrant com embeddings via OpenAI
 * 
 * Uso: curl -X POST http://localhost:9000/admin/rag/seed-collections
 */
export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

    logger.info("🚀 Iniciando seed de collections Qdrant...");

    try {
        // Verificar variáveis de ambiente
        const qdrantUrl = process.env.QDRANT_URL;
        const qdrantApiKey = process.env.QDRANT_API_KEY;
        const openaiApiKey = process.env.OPENAI_API_KEY;

        if (!qdrantUrl || !qdrantApiKey || !openaiApiKey) {
            return res.status(400).json({
                error: "Missing required environment variables",
                missing: {
                    QDRANT_URL: !qdrantUrl,
                    QDRANT_API_KEY: !qdrantApiKey,
                    OPENAI_API_KEY: !openaiApiKey,
                },
            });
        }

        // Inicializar clientes
        const qdrant = new QdrantClient({
            url: qdrantUrl,
            apiKey: qdrantApiKey,
        });

        // Importação dinâmica do OpenAI para evitar problemas de ESM
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: openaiApiKey });

        logger.info("✅ Clientes Qdrant e OpenAI inicializados");

        // Verificar health do Qdrant
        try {
            await qdrant.api().healthz();
            logger.info("✅ Qdrant health check passed");
        } catch (error) {
            logger.error("❌ Erro ao conectar no Qdrant:", error);
            return res.status(503).json({
                error: "Qdrant connection failed",
                details: error instanceof Error ? error.message : String(error),
            });
        }

        // Resolver serviços Medusa
        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

        // 1. Popular ysh-catalog com produtos
        logger.info("📦 Buscando produtos do Medusa...");

        const { data: products } = await query.graph({
            entity: "products",
            fields: ["id", "title", "description", "handle", "metadata", "variants.*"],
            filters: {},
        });

        logger.info(`📊 ${products.length} produtos encontrados`);

        if (products.length === 0) {
            return res.status(200).json({
                message: "No products found. Run seed first.",
                stats: {
                    products: 0,
                    regulations: 0,
                    tariffs: 0,
                    technical: 0,
                },
            });
        }

        // Processar em batches
        const batchSize = 5; // Reduzido para evitar timeout
        let processedCount = 0;

        for (let i = 0; i < Math.min(products.length, 20); i += batchSize) { // Limitar a 20 produtos
            const batch = products.slice(i, i + batchSize);

            logger.info(`🔄 Processando batch ${Math.floor(i / batchSize) + 1}...`);

            const points: Array<{
                id: string;
                vector: number[];
                payload: Record<string, any>;
            }> = [];

            for (const product of batch) {
                try {
                    const variants = product.variants || [];
                    const variantInfo = variants.map((v: any) =>
                        `SKU: ${v.sku || 'N/A'}, Título: ${v.title || product.title}`
                    ).join('; ');

                    const text = [
                        product.title,
                        product.description || '',
                        `Handle: ${product.handle}`,
                        variantInfo,
                    ].filter(Boolean).join('\n');

                    const response = await openai.embeddings.create({
                        model: "text-embedding-3-large",
                        input: text,
                        dimensions: 3072,
                    });

                    const embedding = response.data[0].embedding;

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
                }
            }

            if (points.length > 0) {
                await qdrant.upsert("ysh-catalog", {
                    points,
                    wait: true,
                });

                logger.info(`✅ Batch inserido: ${points.length} produtos`);
            }
        }

        // 2. Popular ysh-regulations (documentos exemplo)
        logger.info("📜 Populando ysh-regulations...");

        const regulationDocs = [
            {
                id: "reg-001",
                title: "REN 482/2012 - Geração Distribuída",
                content: "Regulamentação da ANEEL sobre micro e minigeração distribuída de energia elétrica.",
            },
            {
                id: "reg-002",
                title: "REN 687/2015 - Atualização da GD",
                content: "Atualização das regras de geração distribuída, incluindo múltiplas unidades consumidoras.",
            },
            {
                id: "reg-003",
                title: "Lei 14.300/2022 - Marco Legal da GD",
                content: "Marco legal da geração distribuída no Brasil.",
            },
        ];

        const regPoints: Array<{
            id: string;
            vector: number[];
            payload: Record<string, any>;
        }> = [];

        for (const doc of regulationDocs) {
            const text = `${doc.title}\n${doc.content}`;

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
                    created_at: new Date().toISOString(),
                },
            });
        }

        await qdrant.upsert("ysh-regulations", { points: regPoints, wait: true });
        logger.info(`✅ ysh-regulations: ${regPoints.length} documentos`);

        // Verificar collections
        const collectionStats: Record<string, number> = {};
        const collections = ["ysh-catalog", "ysh-regulations", "ysh-tariffs", "ysh-technical"];

        for (const collectionName of collections) {
            try {
                const info = await qdrant.getCollection(collectionName);
                collectionStats[collectionName] = info.points_count || 0;
            } catch (error) {
                collectionStats[collectionName] = 0;
            }
        }

        logger.info("🎉 Seed concluído!");

        res.json({
            message: "Qdrant collections seeded successfully",
            stats: collectionStats,
            processed: processedCount,
        });

    } catch (error) {
        logger.error("❌ Erro ao fazer seed:", error);

        res.status(500).json({
            error: "Seed failed",
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
