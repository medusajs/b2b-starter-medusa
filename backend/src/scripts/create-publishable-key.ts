import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * Script to create publishable API key by accessing the database directly
 * This allows the storefront to access protected /store endpoints
 */
export default async function createPublishableKey({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const manager = container.resolve(ContainerRegistrationKeys.MANAGER);

    logger.info("🔑 Creating publishable API key using direct database access...");

    try {
        // Check if a publishable key already exists
        const existingKeys = await (manager as any).query(
            `SELECT id, token FROM publishable_api_key LIMIT 1`
        );

        if (existingKeys && existingKeys.length > 0) {
            const key = existingKeys[0];
            logger.info(`\n✅ Publishable API key already exists!`);
            logger.info(`Key ID: ${key.id}`);
            logger.info(`Token: ${key.token}`);
            logger.info(`\nAdd this to your storefront .env:`);
            logger.info(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token}`);
            logger.info(`\n📋 Use this curl to test:`);
            logger.info(`curl -H "x-publishable-api-key: ${key.token}" http://localhost:9000/store/products?limit=5`);
            return;
        }

        // Generate a new UUID for the key
        const crypto = require("crypto");
        const keyId = crypto.randomUUID();
        const token = `pk_${crypto.randomBytes(32).toString("hex")}`;
        const title = "YSH Storefront Key";
        const now = new Date().toISOString();

        // Insert the new key
        await (manager as any).query(
            `INSERT INTO publishable_api_key (id, created_at, updated_at, created_by, revoked_by, revoked_at, title) 
       VALUES ($1, $2, $3, $4, NULL, NULL, $5)`,
            [keyId, now, now, "seed-script", title]
        );

        logger.info(`\n✅ Publishable API key created successfully!`);
        logger.info(`Key ID: ${keyId}`);
        logger.info(`Token: ${token}`);
        logger.info(`\n📋 Next steps:`);
        logger.info(`1. Add this to your storefront .env file:`);
        logger.info(`   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${token}`);
        logger.info(`2. Use this header in API requests:`);
        logger.info(`   x-publishable-api-key: ${token}`);
        logger.info(`\n📋 Test command:`);
        logger.info(`curl -H "x-publishable-api-key: ${token}" http://localhost:9000/store/products?limit=5`);

    } catch (error: any) {
        logger.error(`❌ Error creating publishable API key: ${error.message}`);
        logger.info("\n💡 Alternative: Create the key manually in the admin dashboard");
        logger.info("   1. Go to http://localhost:9000/app");
        logger.info("   2. Login with admin credentials");
        logger.info("   3. Navigate to Settings > API Key Management");
        logger.info("   4. Create a new Publishable API Key");
    }
}
