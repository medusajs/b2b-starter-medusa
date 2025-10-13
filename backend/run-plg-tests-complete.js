/**
 * YSH Solar E-commerce Platform
 * PLG Strategy 360° - Complete HTTP Test Suite
 * 
 * Executes all 27 tests with authentication and PLG validation
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_574e2f71117a1ecc0159005c55e8bf6d561e1741970c6d171b78bc38c5c61bb9';

// Test results
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

let authToken = null;
let customerId = null;

// Setup authentication
async function setupAuth() {
    console.log('🔐 Setting up authentication...\n');

    try {
        const email = `test-${Date.now()}@customer.com`;
        const password = 'testpass123';

        // Register
        const registerRes = await axios.post(
            `${BASE_URL}/auth/customer/emailpass/register`,
            { email, password },
            {
                headers: { 'x-publishable-api-key': PUBLISHABLE_KEY },
                validateStatus: () => true
            }
        );

        if (registerRes.status !== 200) {
            throw new Error(`Registration failed: ${registerRes.status} - ${JSON.stringify(registerRes.data)}`);
        }

        const registerToken = registerRes.data.token;

        // Create customer profile
        const customerRes = await axios.post(
            `${BASE_URL}/store/customers`,
            { email },
            {
                headers: {
                    'x-publishable-api-key': PUBLISHABLE_KEY,
                    'Authorization': `Bearer ${registerToken}`
                },
                validateStatus: () => true
            }
        );

        if (customerRes.status !== 200 && customerRes.status !== 201) {
            throw new Error(`Customer creation failed: ${customerRes.status} - ${JSON.stringify(customerRes.data)}`);
        }

        customerId = customerRes.data.customer.id;

        // Login
        const loginRes = await axios.post(
            `${BASE_URL}/auth/customer/emailpass`,
            { email, password },
            {
                headers: { 'x-publishable-api-key': PUBLISHABLE_KEY },
                validateStatus: () => true
            }
        );

        if (loginRes.status !== 200) {
            throw new Error(`Login failed: ${loginRes.status} - ${JSON.stringify(loginRes.data)}`);
        }

        authToken = loginRes.data.token;

        console.log(`✅ Authentication complete`);
        console.log(`   Customer ID: ${customerId}`);
        console.log(`   Email: ${email}\n`);

        return { authToken, customerId };
    } catch (error) {
        console.error(`❌ Auth failed: ${error.message}`);
        throw error;
    }
}

// Execute test
async function runTest(config) {
    const start = Date.now();
    results.summary.total++;

    try {
        const headers = {
            'x-publishable-api-key': PUBLISHABLE_KEY,
            ...config.headers
        };

        if (config.requiresAuth && authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        // Replace placeholder customer_id
        let body = config.body;
        if (body && customerId) {
            body = JSON.parse(JSON.stringify(body).replace(/CUSTOMER_ID_PLACEHOLDER/g, customerId));
        }

        const response = await axios({
            method: config.method,
            url: `${BASE_URL}${config.path}`,
            headers,
            data: body,
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
            validations: []
        };

        const icon = passed ? '✅' : '❌';
        console.log(`${icon} ${config.name}`);
        console.log(`   Status: ${response.status} | Duration: ${duration}ms`);

        // PLG validations
        if (passed && config.validate) {
            result.validations = config.validate(response.data, results.plg);
            if (result.validations.length > 0) {
                result.validations.forEach(v => console.log(`   ${v}`));
            }
        }

        if (!passed) {
            console.log(`   Expected: ${config.expectedStatus}, Got: ${response.status}`);
            if (response.data?.message) {
                console.log(`   Error: ${response.data.message}`);
            }
        }

        results.tests.push(result);

        // Store IDs for later tests
        if (passed && response.data) {
            if (response.data.id && config.storeId) {
                global[config.storeId] = response.data.id;
            }
        }

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
    console.log('PLG STRATEGY 360° - COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));
    console.log(`\nExecution Date: ${new Date().toISOString()}`);
    console.log(`Total Duration: ${results.summary.totalDuration}ms (${(results.summary.totalDuration / 1000).toFixed(2)}s)`);
    console.log(`\nTest Summary:`);
    console.log(`  ✅ Passed: ${results.summary.passed}/${results.summary.total}`);
    console.log(`  ❌ Failed: ${results.summary.failed}/${results.summary.total}`);
    console.log(`  📊 Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

    console.log('\n' + '-'.repeat(80));
    console.log('PLG VALIDATION SUMMARY - 360° COVERAGE');
    console.log('-'.repeat(80));
    console.log(`\n🎯 Stage 1 - Solar Calculator → Kit Recommendations:`);
    console.log(`   Products Exposed: ${results.plg.stage1_kits} product_id's with catalog links`);
    console.log(`   PLG Metric: ${results.plg.stage1_kits > 0 ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'}`);

    console.log(`\n💰 Stage 2 - Credit Analysis → Financing Offers:`);
    console.log(`   Financing Offers Generated: ${results.plg.stage2_offers} offers`);
    console.log(`   PLG Metric: ${results.plg.stage2_offers >= 3 ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'} (target: ≥3 offers per analysis)`);

    console.log(`\n📅 Stage 3 - Financing Application → Payment Schedule:`);
    console.log(`   Payment Schedules Generated: ${results.plg.stage3_schedules} schedules`);
    console.log(`   PLG Metric: ${results.plg.stage3_schedules > 0 ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'}`);

    console.log(`\n📦 Stage 4 - Order Fulfillment → Tracking Events:`);
    console.log(`   Tracking Events Exposed: ${results.plg.stage4_tracking} events`);
    console.log(`   PLG Metric: ${results.plg.stage4_tracking > 0 ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'}`);

    const plgSuccess = results.plg.stage1_kits > 0 && results.plg.stage2_offers >= 3 &&
        results.plg.stage3_schedules > 0 && results.plg.stage4_tracking > 0;
    console.log(`\n🎯 PLG Strategy 360° Status: ${plgSuccess ? '✅ FULLY IMPLEMENTED' : '⚠️ PARTIALLY IMPLEMENTED'}`);

    console.log('\n' + '-'.repeat(80));
    console.log('PERFORMANCE ANALYSIS');
    console.log('-'.repeat(80));

    const completedTests = results.tests.filter(t => t.duration);
    if (completedTests.length > 0) {
        const avg = completedTests.reduce((sum, t) => sum + t.duration, 0) / completedTests.length;
        const max = Math.max(...completedTests.map(t => t.duration));
        const min = Math.min(...completedTests.map(t => t.duration));

        console.log(`\nResponse Time Statistics:`);
        console.log(`  Average: ${avg.toFixed(2)}ms`);
        console.log(`  Min: ${min}ms`);
        console.log(`  Max: ${max}ms`);

        const slow = completedTests.filter(t => t.duration > 3000);
        if (slow.length > 0) {
            console.log(`\n⚠️  Slow Tests (>3s target): ${slow.length} tests`);
            slow.forEach(t => console.log(`  - ${t.name}: ${t.duration}ms`));
        } else {
            console.log(`\n✅ All tests completed within 3s performance target`);
        }

        const fast = completedTests.filter(t => t.duration < 200);
        console.log(`\n✅ Fast queries (<200ms): ${fast.length}/${completedTests.length} tests`);
    }

    console.log('\n' + '='.repeat(80) + '\n');
}

// Main execution
async function main() {
    console.log('🚀 PLG Strategy 360° - Complete HTTP Test Suite\n');
    console.log('='.repeat(80));
    console.log('YSH SOLAR E-COMMERCE PLATFORM - END-TO-END VALIDATION');
    console.log('='.repeat(80) + '\n');

    try {
        // Setup auth
        await setupAuth();

        console.log('='.repeat(80));
        console.log('EXECUTING 27 TESTS ACROSS 4 PLG STAGES');
        console.log('='.repeat(80) + '\n');

        // Stage 1: Solar Calculations (7 tests)
        console.log('📋 STAGE 1: SOLAR CALCULATIONS (7 tests)\n');

        await runTest({
            name: 'Solar Calc - Residential 450kWh',
            method: 'POST',
            path: '/store/solar-calculations',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                consumo_kwh_mes: 450,
                uf: 'SP',
                tipo_instalacao: 'residencial',
                tipo_telhado: 'ceramico',
                orcamento_disponivel: 30000,
                prioridade_cliente: 'custo_beneficio'
            },
            validate: (data, plg) => {
                const vals = [];
                if (data.kits_recomendados && data.kits_recomendados.length > 0) {
                    plg.stage1_kits += data.kits_recomendados.length;
                    vals.push(`✓ PLG: ${data.kits_recomendados.length} kits with product_id exposure`);
                    const firstKit = data.kits_recomendados[0];
                    vals.push(`  - Top kit: product_id=${firstKit.product_id}, score=${firstKit.match_score}, rank=${firstKit.rank}`);
                }
                return vals;
            },
            storeId: 'calculationId'
        });

        await runTest({
            name: 'Solar Calc - Commercial 1500kWh',
            method: 'POST',
            path: '/store/solar-calculations',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                consumo_kwh_mes: 1500,
                uf: 'RJ',
                tipo_instalacao: 'comercial',
                tipo_telhado: 'metalico',
                orcamento_disponivel: 80000,
                prioridade_cliente: 'qualidade'
            },
            validate: (data, plg) => {
                if (data.kits_recomendados) plg.stage1_kits += data.kits_recomendados.length;
                return data.kits_recomendados ? [`✓ PLG: ${data.kits_recomendados.length} kits`] : [];
            }
        });

        await runTest({
            name: 'Solar Calc - Industrial 5000kWh',
            method: 'POST',
            path: '/store/solar-calculations',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                consumo_kwh_mes: 5000,
                uf: 'MG',
                tipo_instalacao: 'industrial',
                tipo_telhado: 'laje',
                orcamento_disponivel: 250000,
                prioridade_cliente: 'producao'
            },
            validate: (data, plg) => {
                if (data.kits_recomendados) plg.stage1_kits += data.kits_recomendados.length;
                return [];
            }
        });

        await runTest({
            name: 'Solar Calc - Low consumption edge case',
            method: 'POST',
            path: '/store/solar-calculations',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                consumo_kwh_mes: 150,
                uf: 'SC',
                tipo_instalacao: 'residencial',
                tipo_telhado: 'fibrocimento'
            },
            validate: (data, plg) => {
                if (data.kits_recomendados) plg.stage1_kits += data.kits_recomendados.length;
                return [];
            }
        });

        await runTest({
            name: 'Solar Calc - High budget edge case',
            method: 'POST',
            path: '/store/solar-calculations',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                consumo_kwh_mes: 300,
                uf: 'SP',
                tipo_instalacao: 'residencial',
                tipo_telhado: 'ceramico',
                orcamento_disponivel: 100000,
                prioridade_cliente: 'tecnologia'
            },
            validate: (data, plg) => {
                if (data.kits_recomendados) plg.stage1_kits += data.kits_recomendados.length;
                return [];
            }
        });

        await runTest({
            name: 'Solar Calc - Validation error',
            method: 'POST',
            path: '/store/solar-calculations',
            requiresAuth: true,
            expectedStatus: 400,
            body: { customer_id: 'CUSTOMER_ID_PLACEHOLDER' }
        });

        await runTest({
            name: 'Solar Calc - Unauthorized',
            method: 'POST',
            path: '/store/solar-calculations',
            requiresAuth: false,
            expectedStatus: 401,
            body: { consumo_kwh_mes: 450, uf: 'SP' }
        });

        // Stage 2: Credit Analysis (7 tests)
        console.log('\n📋 STAGE 2: CREDIT ANALYSIS (7 tests)\n');

        await runTest({
            name: 'Credit Analysis - CDC modality',
            method: 'POST',
            path: '/store/credit-analyses',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                requested_amount: 30000,
                installments_preference: 60,
                preferred_modality: 'CDC',
                monthly_income: 8000,
                current_debts: 1500
            },
            validate: (data, plg) => {
                const vals = [];
                if (data.best_offers && data.best_offers.length > 0) {
                    plg.stage2_offers += data.best_offers.length;
                    vals.push(`✓ PLG: ${data.best_offers.length} financing offers generated`);
                    data.best_offers.forEach(offer => {
                        vals.push(`  - ${offer.modality}: ${offer.interest_rate_monthly}%/month, R$ ${offer.monthly_payment}/month`);
                    });
                }
                return vals;
            },
            storeId: 'analysisId'
        });

        await runTest({
            name: 'Credit Analysis - LEASING modality',
            method: 'POST',
            path: '/store/credit-analyses',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                requested_amount: 50000,
                installments_preference: 84,
                preferred_modality: 'LEASING',
                monthly_income: 12000,
                current_debts: 2000
            },
            validate: (data, plg) => {
                if (data.best_offers) plg.stage2_offers += data.best_offers.length;
                return data.best_offers ? [`✓ PLG: ${data.best_offers.length} offers`] : [];
            }
        });

        await runTest({
            name: 'Credit Analysis - EAAS modality',
            method: 'POST',
            path: '/store/credit-analyses',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                requested_amount: 80000,
                installments_preference: 120,
                preferred_modality: 'EAAS',
                monthly_income: 15000,
                current_debts: 3000
            },
            validate: (data, plg) => {
                if (data.best_offers) plg.stage2_offers += data.best_offers.length;
                return [];
            }
        });

        await runTest({
            name: 'Credit Analysis - High amount',
            method: 'POST',
            path: '/store/credit-analyses',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                requested_amount: 250000,
                installments_preference: 180,
                monthly_income: 30000,
                current_debts: 5000
            },
            validate: (data, plg) => {
                if (data.best_offers) plg.stage2_offers += data.best_offers.length;
                return [];
            }
        });

        await runTest({
            name: 'Credit Analysis - GET by ID (404)',
            method: 'GET',
            path: '/store/credit-analyses/nonexistent',
            requiresAuth: true,
            expectedStatus: 404
        });

        await runTest({
            name: 'Credit Analysis - Validation error',
            method: 'POST',
            path: '/store/credit-analyses',
            requiresAuth: true,
            expectedStatus: 400,
            body: { customer_id: 'CUSTOMER_ID_PLACEHOLDER' }
        });

        await runTest({
            name: 'Credit Analysis - Unauthorized',
            method: 'POST',
            path: '/store/credit-analyses',
            requiresAuth: false,
            expectedStatus: 401,
            body: { requested_amount: 30000 }
        });

        // Stage 3: Financing Applications (7 tests)
        console.log('\n📋 STAGE 3: FINANCING APPLICATIONS (7 tests)\n');

        await runTest({
            name: 'Financing App - CDC 60 months',
            method: 'POST',
            path: '/store/financing-applications',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                credit_analysis_id: 'analysis_placeholder',
                selected_offer_modality: 'CDC',
                installments: 60,
                principal_amount: 30000
            },
            validate: (data, plg) => {
                const vals = [];
                if (data.payment_schedule && Array.isArray(data.payment_schedule)) {
                    plg.stage3_schedules++;
                    vals.push(`✓ PLG: Payment schedule generated (${data.payment_schedule.length} installments)`);
                    if (data.payment_schedule.length > 0) {
                        const first = data.payment_schedule[0];
                        vals.push(`  - First installment: R$ ${first.total} (principal: ${first.principal}, interest: ${first.interest})`);
                    }
                }
                return vals;
            },
            storeId: 'applicationId'
        });

        await runTest({
            name: 'Financing App - LEASING 84 months',
            method: 'POST',
            path: '/store/financing-applications',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                credit_analysis_id: 'analysis_placeholder',
                selected_offer_modality: 'LEASING',
                installments: 84,
                principal_amount: 50000
            },
            validate: (data, plg) => {
                if (data.payment_schedule) {
                    plg.stage3_schedules++;
                    return [`✓ PLG: ${data.payment_schedule.length} installments`];
                }
                return [];
            }
        });

        await runTest({
            name: 'Financing App - EAAS 120 months',
            method: 'POST',
            path: '/store/financing-applications',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                credit_analysis_id: 'analysis_placeholder',
                selected_offer_modality: 'EAAS',
                installments: 120,
                principal_amount: 80000
            },
            validate: (data, plg) => {
                if (data.payment_schedule) plg.stage3_schedules++;
                return [];
            }
        });

        await runTest({
            name: 'Financing App - 360 months edge case',
            method: 'POST',
            path: '/store/financing-applications',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                credit_analysis_id: 'analysis_placeholder',
                selected_offer_modality: 'EAAS',
                installments: 360,
                principal_amount: 200000
            },
            validate: (data, plg) => {
                const vals = [];
                if (data.payment_schedule && data.payment_schedule.length === 360) {
                    plg.stage3_schedules++;
                    vals.push(`✓ PLG: 360-month schedule (performance: <1s target)`);
                }
                return vals;
            }
        });

        await runTest({
            name: 'Financing App - GET by ID (404)',
            method: 'GET',
            path: '/store/financing-applications/nonexistent',
            requiresAuth: true,
            expectedStatus: 404
        });

        await runTest({
            name: 'Financing App - Validation error',
            method: 'POST',
            path: '/store/financing-applications',
            requiresAuth: true,
            expectedStatus: 400,
            body: { customer_id: 'CUSTOMER_ID_PLACEHOLDER' }
        });

        await runTest({
            name: 'Financing App - Unauthorized',
            method: 'POST',
            path: '/store/financing-applications',
            requiresAuth: false,
            expectedStatus: 401,
            body: { principal_amount: 30000 }
        });

        // Stage 4: Order Fulfillment (6 tests)
        console.log('\n📋 STAGE 4: ORDER FULFILLMENT (6 tests)\n');

        await runTest({
            name: 'Order Fulfillment - Shipped',
            method: 'POST',
            path: '/store/order-fulfillment',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                order_id: 'order_placeholder',
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                financing_application_id: 'app_placeholder',
                fulfillment_status: 'shipped'
            },
            validate: (data, plg) => {
                const vals = [];
                if (data.picked_items && Array.isArray(data.picked_items)) {
                    vals.push(`✓ PLG: ${data.picked_items.length} items with product enrichment`);
                }
                if (data.shipments && data.shipments.length > 0) {
                    const shipment = data.shipments[0];
                    if (shipment.tracking_events) {
                        plg.stage4_tracking += shipment.tracking_events.length;
                        vals.push(`✓ PLG: ${shipment.tracking_events.length} tracking events exposed`);
                    }
                }
                return vals;
            }
        });

        await runTest({
            name: 'Order Fulfillment - Multiple shipments',
            method: 'POST',
            path: '/store/order-fulfillment',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                order_id: 'order_placeholder_2',
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                financing_application_id: 'app_placeholder',
                fulfillment_status: 'shipped'
            },
            validate: (data, plg) => {
                if (data.shipments) {
                    data.shipments.forEach(s => {
                        if (s.tracking_events) plg.stage4_tracking += s.tracking_events.length;
                    });
                }
                return [];
            }
        });

        await runTest({
            name: 'Order Fulfillment - Picking status',
            method: 'POST',
            path: '/store/order-fulfillment',
            requiresAuth: true,
            expectedStatus: 201,
            body: {
                order_id: 'order_placeholder_3',
                customer_id: 'CUSTOMER_ID_PLACEHOLDER',
                fulfillment_status: 'picking'
            }
        });

        await runTest({
            name: 'Order Fulfillment - GET by ID (404)',
            method: 'GET',
            path: '/store/order-fulfillment/nonexistent',
            requiresAuth: true,
            expectedStatus: 404
        });

        await runTest({
            name: 'Order Fulfillment - Validation error',
            method: 'POST',
            path: '/store/order-fulfillment',
            requiresAuth: true,
            expectedStatus: 400,
            body: { customer_id: 'CUSTOMER_ID_PLACEHOLDER' }
        });

        await runTest({
            name: 'Order Fulfillment - Unauthorized',
            method: 'POST',
            path: '/store/order-fulfillment',
            requiresAuth: false,
            expectedStatus: 401,
            body: { order_id: 'order_placeholder' }
        });

        // Generate report
        generateReport();

        process.exit(results.summary.failed > 0 ? 1 : 0);

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    }
}

main();
