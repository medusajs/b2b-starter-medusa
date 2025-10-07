import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, ModuleRegistrationName, ProductStatus } from "@medusajs/framework/utils";

export default async function simpleSeed({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const productService = container.resolve(ModuleRegistrationName.PRODUCT);
    const salesChannelService = container.resolve(ModuleRegistrationName.SALES_CHANNEL);

    logger.info("Creating sales channels...");

    const channels = [
        { name: "YSH-B2C" },
        { name: "YSH-Integradores" },
        { name: "YSH-Marketplace" },
    ];

    for (const channel of channels) {
        try {
            await salesChannelService.createSalesChannels(channel);
            logger.info(`Created sales channel: ${channel.name}`);
        } catch (error) {
            logger.warn(`Sales channel ${channel.name} may already exist`);
        }
    }

    logger.info("Creating sample products...");

    const products = [
        {
            title: "Kit Solar 5kW",
            description: "Kit solar completo com 5kW de potência",
            status: ProductStatus.PUBLISHED,
            metadata: {
                potencia_kwp: 5,
                estrutura: "Metálica",
                centro_distribuicao: "São Paulo",
            },
            variants: [
                {
                    title: "Kit Solar 5kW Standard",
                    sku: "KIT-5KW-001",
                    prices: [{ amount: 15000, currency_code: "brl" }],
                    manage_inventory: false,
                },
            ],
        },
        {
            title: "Painel Solar 400W",
            description: "Painel solar fotovoltaico de 400W",
            status: ProductStatus.PUBLISHED,
            metadata: {
                potencia_kwp: 0.4,
                estrutura: "Vidro",
                centro_distribuicao: "Rio de Janeiro",
            },
            variants: [
                {
                    title: "Painel 400W Mono",
                    sku: "PANEL-400W-001",
                    prices: [{ amount: 800, currency_code: "brl" }],
                    manage_inventory: false,
                },
            ],
        },
    ];

    try {
        await productService.createProducts(products);
        logger.info(`Created ${products.length} products`);
    } catch (error) {
        logger.error("Error creating products:", error);
    }

    logger.info("Seeding completed.");
}