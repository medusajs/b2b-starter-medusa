#!/usr/bin/env node
/**
 * Script standalone para criar publishable key
 * Usa apenas HTTP requests para o Admin API
 * Não depende de imports internos do Medusa
 */

const https = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'supersecret';

function makeRequest(url, options, data = null) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);

        const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 9000,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = https.request(reqOptions, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);

                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
                    }
                } catch (e) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ body });
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function login() {
    console.log('[AUTENTICANDO] Login como admin...');

    const response = await makeRequest(
        `${BACKEND_URL}/auth/user/emailpass`,
        { method: 'POST' },
        { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    );

    console.log('[OK] Autenticado com sucesso\n');
    return response.token;
}

async function createKeyDirectly(token) {
    console.log('[EXECUTANDO] Criando publishable key via API Key Module...\n');

    // Usar a API interna do Medusa para criar a key
    // Como não temos endpoint HTTP direto, vamos usar uma abordagem diferente

    const response = await makeRequest(
        `${BACKEND_URL}/admin/api-keys`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        },
        {
            title: 'Store Frontend Key (Auto-generated)',
            type: 'publishable'
        }
    );

    return response.api_key;
}

async function main() {
    console.log('[INFO] Criando Publishable API Key...\n');

    try {
        // 1. Login
        const token = await login();

        // 2. Criar key
        const apiKey = await createKeyDirectly(token);

        console.log('[OK] Key criada com sucesso!');
        console.log(`ID: ${apiKey.id}`);
        console.log(`Token: ${apiKey.token || apiKey.id}`);
        console.log('');

        console.log('================================================================');
        console.log('  PUBLISHABLE KEY CONFIGURADA COM SUCESSO!');
        console.log('================================================================');
        console.log('');
        console.log(`Token: ${apiKey.token || apiKey.id}`);
        console.log('');
        console.log('Adicione ao storefront/.env:');
        console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${apiKey.token || apiKey.id}`);
        console.log('');

    } catch (error) {
        console.error('[ERRO] Falha ao criar publishable key!');
        console.error(error.message);

        if (error.message.includes('404')) {
            console.log('');
            console.log('[INFO] Endpoint /admin/api-keys nao existe.');
            console.log('[INFO] Vou tentar abordagem alternativa...');
            console.log('');
            console.log('Execute manualmente no container:');
            console.log('');
            console.log('docker exec -it ysh-b2b-backend node -e "');
            console.log('const { MedusaModule } = require(\\"@medusajs/framework/modules-sdk\\");');
            console.log('(async () => {');
            console.log('  const apiKeyModule = MedusaModule.resolve(\\"api-key\\");');
            console.log('  const key = await apiKeyModule.createApiKeys({');
            console.log('    title: \\"Store Frontend Key\\",');
            console.log('    type: \\"publishable\\",');
            console.log('    created_by: \\"script\\"');
            console.log('  });');
            console.log('  console.log(\\"Token:\\", key.token || key.id);');
            console.log('})();');
            console.log('"');
        }

        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
