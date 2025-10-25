/**
 * Script Simplificado: Criar Publishable API Key
 * Baseado em backend/src/scripts/seed.ts
 * Uso: cd backend && yarn medusa exec ./src/scripts/create-key-simple.ts
 */

import {
    createApiKeysWorkflow,
    linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows";
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import * as fs from "fs";
import * as path from "path";

export default async function createPublishableKeySimple({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    logger.info("[INFO] Criando Publishable API Key...");

    try {
        // 1. Verificar keys existentes
        const { data: existingKeys } = await query.graph({
            entity: "api_key",
            fields: ["id", "token", "type", "title"],
            filters: { type: "publishable" },
        });

        if (existingKeys && existingKeys.length > 0) {
            const key = existingKeys[0];
            logger.info("[OK] Publishable key ja existe!");
            logger.info(`ID: ${key.id}`);
            logger.info(`Token: ${key.token}`);

            await saveToEnv(key.token, logger);
            return;
        }

        // 2. Obter Default Sales Channel
        const { data: salesChannels } = await query.graph({
            entity: "sales_channel",
            fields: ["id", "name"],
            filters: { name: "Default Sales Channel" },
        });

        if (!salesChannels || salesChannels.length === 0) {
            throw new Error("Default Sales Channel nao encontrado");
        }

        const defaultChannel = salesChannels[0];
        logger.info(`[OK] Sales Channel: ${defaultChannel.name}`);

        // 3. Criar publishable key usando workflow
        logger.info("[EXECUTANDO] Criando key via workflow...");

        const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
            container
        ).run({
            input: {
                api_keys: [
                    {
                        title: "Store Frontend Key (Auto-generated)",
                        type: "publishable",
                        created_by: "auto-script",
                    },
                ],
            },
        });

        const publishableApiKey = publishableApiKeyResult[0];
        logger.info(`[OK] Key criada: ${publishableApiKey.id}`);

        // 4. Associar ao Sales Channel usando workflow
        logger.info("[EXECUTANDO] Associando ao sales channel...");

        await linkSalesChannelsToApiKeyWorkflow(container).run({
            input: {
                id: publishableApiKey.id,
                add: [defaultChannel.id],
            },
        });

        logger.info("[OK] Key associada ao Default Sales Channel");

        // 5. Salvar no .env
        await saveToEnv(publishableApiKey.id, logger);

        // 6. Mensagem final
        logger.info("");
        logger.info("================================================================");
        logger.info("  PUBLISHABLE KEY CONFIGURADA COM SUCESSO!");
        logger.info("================================================================");
        logger.info("");
        logger.info(`Token: ${publishableApiKey.id}`);
        logger.info("");
        logger.info("PROXIMOS PASSOS:");
        logger.info("1. Reinicie o storefront:");
        logger.info("   docker compose -f docker/docker-compose.yml restart storefront");
        logger.info("");
        logger.info("2. Teste a API:");
        logger.info(`   curl -H "x-publishable-api-key: ${publishableApiKey.id}" http://localhost:9000/store/products?limit=1`);
        logger.info("");

    } catch (error: any) {
        logger.error("[ERRO] Falha ao criar publishable key!");
        logger.error(error.message);
        if (error.stack) {
            logger.error(error.stack);
        }
        throw error;
    }
}

async function saveToEnv(token: string, logger: any) {
    logger.info("[SALVANDO] Token em arquivo...");

    const projectRoot = path.resolve(__dirname, "../..");
    const envFile = path.join(projectRoot, "storefront", ".env");
    const backupFile = path.join(projectRoot, "storefront", ".publishable-key.txt");

    try {
        let envContent = "";

        if (fs.existsSync(envFile)) {
            envContent = fs.readFileSync(envFile, "utf8");
        }

        const keyRegex = /NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*/;

        if (keyRegex.test(envContent)) {
            envContent = envContent.replace(
                keyRegex,
                `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${token}`
            );
            logger.info("[OK] Variavel atualizada no .env");
        } else {
            if (envContent && !envContent.endsWith("\n")) {
                envContent += "\n";
            }
            envContent += `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${token}\n`;
            logger.info("[OK] Variavel adicionada ao .env");
        }

        fs.writeFileSync(envFile, envContent, "utf8");
        fs.writeFileSync(backupFile, token, "utf8");

        logger.info(`[ARQUIVO] ${envFile}`);
        logger.info(`[BACKUP] ${backupFile}`);
        logger.info("");

    } catch (error: any) {
        logger.warn(`[AVISO] Nao foi possivel salvar: ${error.message}`);
        logger.info(`Token: ${token}`);
        logger.info("Adicione manualmente ao storefront/.env:");
        logger.info(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${token}`);
    }
}
