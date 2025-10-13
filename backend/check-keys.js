const https = require('http');
const BACKEND_URL = 'http://localhost:9000';

async function makeRequest(url, options, data = null) {
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
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
                    }
                } catch (e) {
                    resolve({ body });
                }
            });
        });

        req.on('error', (error) => { reject(error); });
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    try {
        console.log('Logging in...');
        const loginRes = await makeRequest(`${BACKEND_URL}/auth/user/emailpass`, { method: 'POST' }, {
            email: 'admin@test.com',
            password: 'supersecret'
        });

        console.log('Getting publishable keys...');
        const keysRes = await makeRequest(`${BACKEND_URL}/admin/api-keys?type=publishable`, {
            headers: { 'Authorization': `Bearer ${loginRes.token}` }
        });

        console.log('Publishable keys:');
        keysRes.api_keys.forEach(key => {
            console.log(`- ${key.id}: ${key.title} (${key.token ? 'has token' : 'no token'})`);
            if (key.sales_channels && key.sales_channels.length > 0) {
                console.log(`  Sales channels: ${key.sales_channels.map(sc => sc.name).join(', ')}`);
            } else {
                console.log('  No sales channels associated');
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();