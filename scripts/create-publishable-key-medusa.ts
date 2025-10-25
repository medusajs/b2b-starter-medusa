/**
 * Script para criar Publishable API Key usando Medusa API Key Module
 * Uso: cd backend && yarn medusa exec ../scripts/create-publishable-key-medusa.ts
 */

import {
    ApiKeyType,
    ContainerRegistrationKeys,
    Modules,
} from "@medusajs/framework/utils";
import {
    ExecArgs,
    IApiKeyModuleService,
    ILinkModulesService,
} from "@medusajs/framework/types";
import * as fs from "fs";
import * as path from "path";

export default async function createPublishableKey({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const apiKeyModule = container.resolve<IApiKeyModuleService>(Modules.API_KEY);
    const linkModulesService = container.resolve<ILinkModulesService>(
        ContainerRegistrationKeys.REMOTE_LINK
    );
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    logger.info("[INFO] Criando Publishable API Key para Medusa Store...");
    logger.info("");

    try {
        // 1. Verificar se já existe publishable key
        logger.info("[VERIFICANDO] Publishable keys existentes...");

        const existingKeys = await apiKeyModule.listApiKeys({
            type: ApiKeyType.PUBLISHABLE,
        });

        if (existingKeys && existingKeys.length > 0) {
            const key = existingKeys[0];
            logger.info("[OK] Publishable key ja existe!");
            logger.info(`Key ID: ${key.id}`);
            logger.info(`Token: ${key.token}`);
            logger.info("");
            logger.info("Token salvo em storefront/.env e backup criado.");

            // Salvar no .env mesmo se já existir
            await saveToEnvFile(key.token, logger);

            return;
        }

        // 2. Obter Default Sales Channel
        logger.info("[VERIFICANDO] Default Sales Channel...");

        const { data: salesChannels } = await query.graph({
            entity: "sales_channel",
            fields: ["id", "name"],
            filters: {
                name: "Default Sales Channel",
            },
        });

        if (!salesChannels || salesChannels.length === 0) {
            throw new Error("Default Sales Channel nao encontrado!");
        }

        const defaultChannel = salesChannels[0];
        logger.info(`[OK] Sales Channel: ${defaultChannel.name} (${defaultChannel.id})`);
        logger.info("");

        // 3. Criar publishable key
        logger.info("[EXECUTANDO] Criando publishable key...");

        const publishableKey = await apiKeyModule.createApiKeys({
            title: "Store Frontend Key (Auto-generated)",
            type: ApiKeyType.PUBLISHABLE,
            created_by: "auto-script",
        });

        logger.info(`[OK] Key criada: ${publishableKey.id}`);
        logger.info("");

        // 4. Associar ao Sales Channel
        logger.info("[EXECUTANDO] Associando key ao sales channel...");

        await linkModulesService.create({
            [Modules.API_KEY]: {
                publishable_api_key_id: publishableKey.id,
            },
            [Modules.SALES_CHANNEL]: {
                sales_channel_id: defaultChannel.id,
            },
        });

        logger.info("[OK] Key associada ao Default Sales Channel");
        logger.info("");

        // 5. Salvar em arquivo
        await saveToEnvFile(publishableKey.token, logger);

        // 6. Mensagem final
        logger.info("================================================================");
        logger.info("  PUBLISHABLE KEY CONFIGURADA COM SUCESSO!");
        logger.info("================================================================");
        logger.info("");
        logger.info("PROXIMOS PASSOS:");
        logger.info("");
        logger.info("1. Token ja foi adicionado ao storefront/.env");
        logger.info("");
        logger.info("2. Reinicie o storefront:");
        logger.info("   docker compose -f docker/docker-compose.yml restart storefront");
        logger.info("");
        logger.info("3. Teste a API:");
        logger.info(`   curl -H "x-publishable-api-key: ${publishableKey.token}" http://localhost:9000/store/products?limit=1`);
        logger.info("");
        logger.info("4. Acesse o PDP:");
        logger.info("   http://localhost:8000/br/products/kit-solar-5kw");
        logger.info("");

    } catch (error: any) {
        logger.error("[ERRO] Falha ao criar publishable key!");
        logger.error(error.message);
        if (error.stack) {
            logger.error(error.stack);
        }
        process.exit(1);
    }
}

async function saveToEnvFile(token: string, logger: any) {
    logger.info("[SALVANDO] Token em arquivo...");

    const projectRoot = path.resolve(__dirname, "..");
    const envFile = path.join(projectRoot, "storefront", ".env");
    const backupFile = path.join(projectRoot, "storefront", ".publishable-key.txt");

    try {
        let envContent = "";

        // Ler conteudo atual do .env se existir
        if (fs.existsSync(envFile)) {
            envContent = fs.readFileSync(envFile, "utf8");
        }

        // Verificar se ja existe a variavel
        const keyRegex = /NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*/;

        if (keyRegex.test(envContent)) {
            // Substituir valor existente
            envContent = envContent.replace(
                keyRegex,
                `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${token}`
            );
            logger.info("[OK] Variavel NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY atualizada");
        } else {
            // Adicionar nova variavel
            if (envContent && !envContent.endsWith("\n")) {
                envContent += "\n";
            }
            envContent += `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${token}\n`;
            logger.info("[OK] Variavel NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY adicionada");
        }

        // Salvar arquivo
        fs.writeFileSync(envFile, envContent, "utf8");
        logger.info(`[ARQUIVO] Atualizado: ${envFile}`);
        logger.info("");

        // Criar arquivo de backup
        fs.writeFileSync(backupFile, token, "utf8");
        logger.info(`[BACKUP] Token salvo em: ${backupFile}`);
        logger.info("");

    } catch (error: any) {
        logger.warn(`[AVISO] Nao foi possivel salvar em .env: ${error.message}`);
        logger.info(`Token: ${token}`);
        logger.info("Por favor, adicione manualmente ao storefront/.env:");
        logger.info(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${token}`);
        logger.info("");
    }
}
