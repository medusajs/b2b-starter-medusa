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

        console.log('Creating publishable key...');
        const keyRes = await makeRequest(`${BACKEND_URL}/admin/api-keys`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${loginRes.token}` }
        }, {
            title: 'Store Frontend Key',
            type: 'publishable'
        });

        console.log('SUCCESS!');
        console.log('Publishable Key:', keyRes.api_key.token || keyRes.api_key.id);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();