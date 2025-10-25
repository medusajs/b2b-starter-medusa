#!/usr/bin/env node
/**
 * Script simplificado para criar Publishable Key via API HTTP
 * Funciona sem depender de imports internos do Medusa
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'supersecret';

async function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch {
                        resolve(body);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function loginAdmin() {
    console.log('🔐 Fazendo login como admin...');

    const url = new URL(`${BACKEND_URL}/admin/auth/user/emailpass`);

    const options = {
        hostname: url.hostname,
        port: url.port || 9000,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = await makeRequest(options, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    console.log('✅ Login realizado com sucesso\n');

    return response.token;
}

async function getSalesChannels(token) {
    console.log('🔍 Buscando Sales Channels...');

    const url = new URL(`${BACKEND_URL}/admin/sales-channels`);

    const options = {
        hostname: url.hostname,
        port: url.port || 9000,
        path: url.pathname,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    const response = await makeRequest(options);

    if (!response.sales_channels || response.sales_channels.length === 0) {
        throw new Error('❌ Nenhum Sales Channel encontrado. Execute o seed primeiro!');
    }

    const defaultChannel = response.sales_channels.find(sc =>
        sc.name.toLowerCase().includes('default') ||
        sc.name.toLowerCase().includes('b2b')
    ) || response.sales_channels[0];

    console.log(`✅ Sales Channel encontrado: ${defaultChannel.name} (${defaultChannel.id})\n`);

    return defaultChannel;
}

async function createPublishableKey(token, salesChannelId) {
    console.log('🔨 Criando Publishable Key...');

    const url = new URL(`${BACKEND_URL}/admin/publishable-api-keys`);

    const options = {
        hostname: url.hostname,
        port: url.port || 9000,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    const response = await makeRequest(options, {
        title: 'Default B2B Publishable Key',
        sales_channel_ids: [salesChannelId],
    });

    const keyId = response.publishable_api_key?.id;

    if (!keyId) {
        throw new Error('❌ Falha ao criar Publishable Key');
    }

    console.log(`✅ Publishable Key criada: ${keyId}\n`);

    return keyId;
}

async function getExistingPublishableKey(token) {
    console.log('🔍 Verificando publishable keys existentes...');

    const url = new URL(`${BACKEND_URL}/admin/publishable-api-keys`);

    const options = {
        hostname: url.hostname,
        port: url.port || 9000,
        path: url.pathname,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await makeRequest(options);

        if (response.publishable_api_keys && response.publishable_api_keys.length > 0) {
            const activeKeys = response.publishable_api_keys.filter(key => !key.revoked_at);

            if (activeKeys.length > 0) {
                const keyId = activeKeys[0].id;
                console.log(`✅ Publishable key ativa já existe: ${keyId}\n`);
                return keyId;
            }
        }
    } catch (error) {
        console.log('⚠️  Nenhuma key existente encontrada, criando nova...\n');
    }

    return null;
}

function saveKeyToEnvFiles(keyId) {
    console.log('💾 Salvando key nos arquivos .env...');

    const backendEnvPath = path.join(__dirname, '..', '.env');
    const storefrontEnvPath = path.join(__dirname, '..', '..', 'storefront', '.env.local');

    // Backend .env
    try {
        let envContent = '';

        if (fs.existsSync(backendEnvPath)) {
            envContent = fs.readFileSync(backendEnvPath, 'utf8');
        }

        envContent = envContent
            .split('\n')
            .filter(line => !line.startsWith('NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY='))
            .join('\n');

        if (!envContent.endsWith('\n')) {
            envContent += '\n';
        }
        envContent += `\n# Publishable Key (gerado em ${new Date().toISOString()})\n`;
        envContent += `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${keyId}\n`;

        fs.writeFileSync(backendEnvPath, envContent);
        console.log(`✅ Key salva em: ${backendEnvPath}`);

    } catch (error) {
        console.warn(`⚠️  Erro ao salvar backend .env: ${error.message}`);
    }

    // Storefront .env.local
    try {
        const storefrontDir = path.dirname(storefrontEnvPath);

        if (fs.existsSync(storefrontDir)) {
            let storefrontEnvContent = '';

            if (fs.existsSync(storefrontEnvPath)) {
                storefrontEnvContent = fs.readFileSync(storefrontEnvPath, 'utf8');
            }

            storefrontEnvContent = storefrontEnvContent
                .split('\n')
                .filter(line => !line.startsWith('NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY='))
                .join('\n');

            if (!storefrontEnvContent.endsWith('\n')) {
                storefrontEnvContent += '\n';
            }
            storefrontEnvContent += `\n# Publishable Key (gerado em ${new Date().toISOString()})\n`;
            storefrontEnvContent += `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${keyId}\n`;

            fs.writeFileSync(storefrontEnvPath, storefrontEnvContent);
            console.log(`✅ Key salva em: ${storefrontEnvPath}`);
        }

    } catch (error) {
        console.warn(`⚠️  Erro ao salvar storefront .env: ${error.message}`);
    }

    console.log();
}

async function uploadKeyToAWS(keyId) {
    console.log('☁️  Fazendo upload do Publishable Key para AWS Secrets Manager...');

    try {
        execSync(
            `aws secretsmanager update-secret --secret-id /ysh-b2b/publishable-key --secret-string "${keyId}" --region us-east-1`,
            { stdio: 'inherit' }
        );

        console.log('✅ Publishable Key enviada para AWS Secrets Manager');
        console.log('📋 Secret ID: /ysh-b2b/publishable-key\n');

    } catch (error) {
        console.warn(`⚠️  Não foi possível fazer upload para AWS: ${error.message}`);
        console.warn(`   Execute manualmente:`);
        console.warn(`   aws secretsmanager update-secret --secret-id /ysh-b2b/publishable-key --secret-string "${keyId}" --region us-east-1\n`);
    }
}

async function main() {
    console.log('🔑 Setup Automático do Publishable Key\n');

    try {
        // 1. Login
        const token = await loginAdmin();

        // 2. Verificar se já existe key
        let keyId = await getExistingPublishableKey(token);

        // 3. Se não existe, criar nova
        if (!keyId) {
            const salesChannel = await getSalesChannels(token);
            keyId = await createPublishableKey(token, salesChannel.id);
        }

        // 4. Salvar nos arquivos .env
        saveKeyToEnvFiles(keyId);

        // 5. Upload para AWS (se solicitado)
        if (process.argv.includes('--upload') || process.argv.includes('--aws')) {
            await uploadKeyToAWS(keyId);
        }

        console.log('🎉 Setup do Publishable Key concluído com sucesso!\n');
        console.log('📋 Próximos passos:');
        console.log('   1. Reinicie o backend: npm run dev');
        console.log('   2. Reinicie o storefront: cd ../storefront && npm run dev');
        console.log(`   3. Use a key: ${keyId}\n`);

        if (!process.argv.includes('--upload') && !process.argv.includes('--aws')) {
            console.log('💡 Dica: Execute com --upload para enviar para AWS Secrets Manager\n');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error('\n💡 Certifique-se de que:');
        console.error('   - O backend está rodando em http://localhost:9000');
        console.error('   - As credenciais de admin estão corretas');
        console.error('   - O banco de dados foi migrado e seedado\n');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };
