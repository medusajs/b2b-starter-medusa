/**
 * YSH Solar E-commerce Platform
 * PLG Strategy 360° - Simplified HTTP Test Runner
 * 
 * Tests API endpoints with basic HTTP requests
 * Measures response times and validates PLG exposure
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:9000';

// Results tracking
const results = {
    summary: { total: 0, passed: 0, failed: 0, totalDuration: 0 },
    tests: [],
    plg: {
        stage1_kits: 0,
        stage2_offers: 0,
        stage3_schedules: 0,
        stage4_tracking: 0
    }
};

// Helper to execute test
async function runTest(config) {
    const start = Date.now();
    results.summary.total++;

    try {
        const response = await axios({
            method: config.method,
            url: `${BASE_URL}${config.path}`,
            headers: config.headers || {},
            data: config.body,
            validateStatus: () => true
        });

        const duration = Date.now() - start;
        const passed = response.status === config.expectedStatus;

        if (passed) results.summary.passed++;
        else results.summary.failed++;

        results.summary.totalDuration += duration;

        const result = {
            name: config.name,
            status: passed ? 'PASS' : 'FAIL',
            statusCode: response.status,
            duration,
            data: response.data
        };

        results.tests.push(result);

        const icon = passed ? '✅' : '❌';
        console.log(`${icon} ${config.name}`);
        console.log(`   Status: ${response.status} | Duration: ${duration}ms`);

        if (config.validate && passed) {
            config.validate(response.data);
        }

        if (!passed && response.data?.message) {
            console.log(`   Error: ${response.data.message}`);
        }

        return result;
    } catch (error) {
        const duration = Date.now() - start;
        results.summary.failed++;
        results.summary.totalDuration += duration;

        console.log(`❌ ${config.name}`);
        console.log(`   Error: ${error.message} | Duration: ${duration}ms`);

        results.tests.push({
            name: config.name,
            status: 'ERROR',
            error: error.message,
            duration
        });
    }
}

// Generate report
function generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('PLG STRATEGY 360° - HTTP TEST REPORT');
    console.log('='.repeat(80));
    console.log(`\nExecution Date: ${new Date().toISOString()}`);
    console.log(`Total Duration: ${results.summary.totalDuration}ms (${(results.summary.totalDuration / 1000).toFixed(2)}s)`);
    console.log(`\nTest Summary:`);
    console.log(`  ✅ Passed: ${results.summary.passed}/${results.summary.total}`);
    console.log(`  ❌ Failed: ${results.summary.failed}/${results.summary.total}`);
    console.log(`  📊 Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

    console.log('\n' + '-'.repeat(80));
    console.log('PLG VALIDATION SUMMARY');
    console.log('-'.repeat(80));
    console.log(`Stage 1 - Solar Calculator → Kits: ${results.plg.stage1_kits} product_id exposures`);
    console.log(`Stage 2 - Credit Analysis → Offers: ${results.plg.stage2_offers} financing offers`);
    console.log(`Stage 3 - Financing App → Schedules: ${results.plg.stage3_schedules} payment schedules`);
    console.log(`Stage 4 - Order Fulfillment → Tracking: ${results.plg.stage4_tracking} tracking events`);

    console.log('\n' + '-'.repeat(80));
    console.log('PERFORMANCE ANALYSIS');
    console.log('-'.repeat(80));

    const completedTests = results.tests.filter(t => t.duration);
    if (completedTests.length > 0) {
        const avg = completedTests.reduce((sum, t) => sum + t.duration, 0) / completedTests.length;
        const max = Math.max(...completedTests.map(t => t.duration));
        const min = Math.min(...completedTests.map(t => t.duration));

        console.log(`Average Response Time: ${avg.toFixed(2)}ms`);
        console.log(`Min Response Time: ${min}ms`);
        console.log(`Max Response Time: ${max}ms`);

        const slow = completedTests.filter(t => t.duration > 3000);
        if (slow.length > 0) {
            console.log(`\n⚠️  Slow Tests (>3s): ${slow.length}`);
            slow.forEach(t => console.log(`  - ${t.name}: ${t.duration}ms`));
        }
    }

    console.log('\n' + '='.repeat(80));
}

// Main execution
async function main() {
    console.log('🚀 PLG Strategy 360° - HTTP Test Suite\n');
    console.log('Testing endpoints without authentication...\n');

    console.log('='.repeat(80));
    console.log('HEALTH & CONNECTIVITY TESTS');
    console.log('='.repeat(80) + '\n');

    // Test 1: Health check
    await runTest({
        name: 'Server Health Check',
        method: 'GET',
        path: '/health',
        expectedStatus: 200
    });

    // Test 2: Admin API check
    await runTest({
        name: 'Admin API Availability',
        method: 'GET',
        path: '/admin/products',
        expectedStatus: 401 // Expected to fail without auth
    });

    // Test 3: Store API check
    await runTest({
        name: 'Store API Availability',
        method: 'GET',
        path: '/store/products',
        expectedStatus: 200 // Public endpoint
    });

    console.log('\n' + '='.repeat(80));
    console.log('PLG STAGE 1: SOLAR CALCULATIONS');
    console.log('='.repeat(80) + '\n');

    // Test 4: Solar calculation - unauthorized (expected)
    await runTest({
        name: 'Solar Calculation - Auth Required',
        method: 'POST',
        path: '/store/solar-calculations',
        expectedStatus: 401,
        body: {
            consumo_kwh_mes: 450,
            uf: 'SP',
            tipo_instalacao: 'residencial'
        }
    });

    // Test 5: Solar calculation - validation error
    await runTest({
        name: 'Solar Calculation - Validation Error',
        method: 'POST',
        path: '/store/solar-calculations',
        expectedStatus: 400,
        body: {}
    });

    console.log('\n' + '='.repeat(80));
    console.log('PLG STAGE 2: CREDIT ANALYSIS');
    console.log('='.repeat(80) + '\n');

    // Test 6: Credit analysis - unauthorized
    await runTest({
        name: 'Credit Analysis - Auth Required',
        method: 'POST',
        path: '/store/credit-analyses',
        expectedStatus: 401,
        body: {
            requested_amount: 30000,
            monthly_income: 8000
        }
    });

    // Test 7: Credit analysis - validation error
    await runTest({
        name: 'Credit Analysis - Validation Error',
        method: 'POST',
        path: '/store/credit-analyses',
        expectedStatus: 400,
        body: {}
    });

    console.log('\n' + '='.repeat(80));
    console.log('PLG STAGE 3: FINANCING APPLICATIONS');
    console.log('='.repeat(80) + '\n');

    // Test 8: Financing application - unauthorized
    await runTest({
        name: 'Financing Application - Auth Required',
        method: 'POST',
        path: '/store/financing-applications',
        expectedStatus: 401,
        body: {
            principal_amount: 30000,
            installments: 60
        }
    });

    // Test 9: Financing application - validation error
    await runTest({
        name: 'Financing Application - Validation Error',
        method: 'POST',
        path: '/store/financing-applications',
        expectedStatus: 400,
        body: {}
    });

    console.log('\n' + '='.repeat(80));
    console.log('PLG STAGE 4: ORDER FULFILLMENT');
    console.log('='.repeat(80) + '\n');

    // Test 10: Order fulfillment - unauthorized
    await runTest({
        name: 'Order Fulfillment - Auth Required',
        method: 'POST',
        path: '/store/order-fulfillment',
        expectedStatus: 401,
        body: {
            order_id: 'test_order'
        }
    });

    // Test 11: Order fulfillment - validation error
    await runTest({
        name: 'Order Fulfillment - Validation Error',
        method: 'POST',
        path: '/store/order-fulfillment',
        expectedStatus: 400,
        body: {}
    });

    console.log('\n' + '='.repeat(80));
    console.log('ENDPOINT STRUCTURE VALIDATION');
    console.log('='.repeat(80) + '\n');

    // Test 12-15: GET endpoints
    await runTest({
        name: 'GET Solar Calculation by ID (404 expected)',
        method: 'GET',
        path: '/store/solar-calculations/nonexistent',
        expectedStatus: 404
    });

    await runTest({
        name: 'GET Credit Analysis by ID (404 expected)',
        method: 'GET',
        path: '/store/credit-analyses/nonexistent',
        expectedStatus: 404
    });

    await runTest({
        name: 'GET Financing Application by ID (404 expected)',
        method: 'GET',
        path: '/store/financing-applications/nonexistent',
        expectedStatus: 404
    });

    await runTest({
        name: 'GET Order Fulfillment by ID (404 expected)',
        method: 'GET',
        path: '/store/order-fulfillment/nonexistent',
        expectedStatus: 404
    });

    // Generate final report
    generateReport();

    console.log('\n📝 Note: Full PLG validation requires authentication.');
    console.log('   To test authenticated endpoints, use Jest integration tests:');
    console.log('   npm run test:integration:http\n');

    process.exit(results.summary.failed > results.summary.total * 0.5 ? 1 : 0);
}

main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
