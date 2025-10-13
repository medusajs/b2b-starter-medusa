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

        console.log('Getting sales channels...');
        const channelsRes = await makeRequest(`${BACKEND_URL}/admin/sales-channels`, {
            headers: { 'Authorization': `Bearer ${loginRes.token}` }
        });

        console.log('Available sales channels:');
        channelsRes.sales_channels.forEach(ch => {
            console.log(`- ${ch.id}: ${ch.name}`);
        });

        if (channelsRes.sales_channels.length > 0) {
            const defaultChannel = channelsRes.sales_channels[0];
            console.log(`Using channel: ${defaultChannel.id}`);

            console.log('Updating publishable key...');
            const updateRes = await makeRequest(`${BACKEND_URL}/admin/api-keys/pk_a669c0c4b4e34a0e8500b4b76a326275cf221054e9a0b799021a897aae532643`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${loginRes.token}` }
            }, {
                sales_channel_ids: [defaultChannel.id]
            });

            console.log('SUCCESS! Key updated with sales channel');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();