/**
 * YSH Solar E-commerce Platform
 * PLG Strategy 360° - Sequential HTTP Test Execution
 * 
 * Executes 27 HTTP tests sequentially across 4 modules:
 * 1. Solar Calculations (7 tests) - Stage 1: Calculator → Kit Recommendations
 * 2. Credit Analysis (7 tests) - Stage 2: Credit Analysis → Financing Offers
 * 3. Financing Applications (7 tests) - Stage 3: Application → Payment Schedule
 * 4. Order Fulfillment (6 tests) - Stage 4: Order → Fulfillment → Tracking
 * 
 * Performance Targets:
 * - query.graph() < 200ms (product enrichment)
 * - Workflow execution < 3s
 * - Payment schedule generation < 1s (360 installments)
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';
import Scrypt from 'scrypt-kdf';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { MedusaModule, Modules } = require('@medusajs/framework/utils');

const BASE_URL = 'http://localhost:9000';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Test results storage
const results = {
  summary: {
    total: 27,
    passed: 0,
    failed: 0,
    skipped: 0,
    totalDuration: 0
  },
  tests: [],
  plgValidations: {
    stage1_products_exposed: 0,
    stage2_financing_offers: 0,
    stage3_payment_schedules: 0,
    stage4_tracking_events: 0
  }
};

// Initialize Medusa modules and create test user
async function setupAuthentication() {
  console.log('🔐 Setting up authentication...');
  
  try {
    // Initialize Medusa modules
    const container = await MedusaModule({
      modulesConfig: {},
    });

    const userModule = container.resolve(Modules.USER);
    const authModule = container.resolve(Modules.AUTH);

    // Create test admin user
    const adminUser = await userModule.createUsers({
      first_name: 'Test',
      last_name: 'Admin',
      email: 'admin@test.com',
    });

    const hashConfig = { logN: 15, r: 8, p: 1 };
    const passwordHash = await Scrypt.kdf('testpassword', hashConfig);

    const adminAuthIdentity = await authModule.createAuthIdentities({
      provider_identities: [
        {
          provider: 'emailpass',
          entity_id: 'admin@test.com',
          provider_metadata: {
            password: passwordHash.toString('base64'),
          },
        },
      ],
      app_metadata: {
        user_id: adminUser.id,
      },
    });

    const adminToken = jwt.sign(
      {
        actor_id: adminUser.id,
        actor_type: 'user',
        auth_identity_id: adminAuthIdentity.id,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Register and create test customer
    const registerResponse = await axios.post(`${BASE_URL}/auth/customer/emailpass/register`, {
      email: 'test@customer.com',
      password: 'testpassword',
    });

    const registerToken = registerResponse.data.token;

    const customerResponse = await axios.post(
      `${BASE_URL}/store/customers`,
      { email: 'test@customer.com' },
      { headers: { Authorization: `Bearer ${registerToken}` } }
    );

    const customer = customerResponse.data.customer;

    // Login to get customer token
    const loginResponse = await axios.post(`${BASE_URL}/auth/customer/emailpass`, {
      email: 'test@customer.com',
      password: 'testpassword',
    });

    const customerToken = loginResponse.data.token;

    console.log('✅ Authentication setup complete');
    console.log(`   Admin User ID: ${adminUser.id}`);
    console.log(`   Customer ID: ${customer.id}`);

    return {
      adminToken,
      customerToken,
      customerId: customer.id,
      adminUserId: adminUser.id,
    };
  } catch (error) {
    console.error('❌ Authentication setup failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    throw error;
  }
}

// Execute single HTTP test
async function executeTest(testConfig, auth) {
  const startTime = Date.now();
  const result = {
    name: testConfig.name,
    module: testConfig.module,
    status: 'pending',
    duration: 0,
    statusCode: null,
    validations: [],
    error: null,
  };

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...testConfig.headers,
    };

    if (testConfig.requiresAuth && !testConfig.testUnauth) {
      headers['Authorization'] = `Bearer ${auth.customerToken}`;
    }

    // Replace customer_id placeholder
    let requestBody = testConfig.body;
    if (requestBody && typeof requestBody === 'object') {
      requestBody = JSON.parse(
        JSON.stringify(requestBody).replace(/cust_01JJZM5K3XWCQY8FVHM2N0PG7T/g, auth.customerId)
      );
    }

    const response = await axios({
      method: testConfig.method,
      url: `${BASE_URL}${testConfig.path}`,
      headers,
      data: requestBody,
      validateStatus: () => true, // Don't throw on any status
    });

    const duration = Date.now() - startTime;
    result.duration = duration;
    result.statusCode = response.status;

    // Validate response
    if (testConfig.expectedStatus === response.status) {
      result.status = 'passed';
      results.summary.passed++;

      // PLG validations
      if (testConfig.plgValidations) {
        result.validations = testConfig.plgValidations(response.data, results.plgValidations);
      }
    } else {
      result.status = 'failed';
      results.summary.failed++;
      result.error = `Expected status ${testConfig.expectedStatus}, got ${response.status}`;
      if (response.data?.message) {
        result.error += ` - ${response.data.message}`;
      }
    }

    console.log(`${result.status === 'passed' ? '✅' : '❌'} ${testConfig.name} (${duration}ms)`);
    if (result.validations.length > 0) {
      result.validations.forEach(v => console.log(`   ${v}`));
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    result.duration = duration;
    result.status = 'failed';
    result.error = error.message;
    results.summary.failed++;
    console.log(`❌ ${testConfig.name} (${duration}ms) - ${error.message}`);
  }

  results.summary.totalDuration += result.duration;
  results.tests.push(result);

  return result;
}

// Test configurations
const testSuites = {
  solarCalculations: [
    {
      name: 'Solar Calculation - Residential 450 kWh',
      module: 'solar-calculations',
      method: 'POST',
      path: '/store/solar-calculations',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        consumo_kwh_mes: 450,
        uf: 'SP',
        tipo_instalacao: 'residencial',
        tipo_telhado: 'ceramico',
        orcamento_disponivel: 30000,
        prioridade_cliente: 'custo_beneficio'
      },
      plgValidations: (data, plgStats) => {
        const validations = [];
        if (data.kits_recomendados && data.kits_recomendados.length > 0) {
          validations.push(`✓ PLG Stage 1: ${data.kits_recomendados.length} kits with product_id exposure`);
          plgStats.stage1_products_exposed += data.kits_recomendados.length;
          data.kits_recomendados.forEach(kit => {
            if (kit.product_id) validations.push(`  - Kit rank ${kit.rank}: product_id=${kit.product_id}, score=${kit.match_score}`);
          });
        }
        return validations;
      }
    },
    {
      name: 'Solar Calculation - Commercial 1500 kWh',
      module: 'solar-calculations',
      method: 'POST',
      path: '/store/solar-calculations',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        consumo_kwh_mes: 1500,
        uf: 'RJ',
        tipo_instalacao: 'comercial',
        tipo_telhado: 'metalico',
        orcamento_disponivel: 80000,
        prioridade_cliente: 'qualidade'
      },
      plgValidations: (data, plgStats) => {
        if (data.kits_recomendados) {
          plgStats.stage1_products_exposed += data.kits_recomendados.length;
          return [`✓ PLG Stage 1: ${data.kits_recomendados.length} kits exposed`];
        }
        return [];
      }
    },
    {
      name: 'Solar Calculation - Industrial 5000 kWh',
      module: 'solar-calculations',
      method: 'POST',
      path: '/store/solar-calculations',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        consumo_kwh_mes: 5000,
        uf: 'MG',
        tipo_instalacao: 'industrial',
        tipo_telhado: 'laje',
        orcamento_disponivel: 250000,
        prioridade_cliente: 'producao'
      },
      plgValidations: (data, plgStats) => {
        if (data.kits_recomendados) {
          plgStats.stage1_products_exposed += data.kits_recomendados.length;
          return [`✓ PLG Stage 1: ${data.kits_recomendados.length} kits exposed`];
        }
        return [];
      }
    },
    {
      name: 'Solar Calculation - Low consumption edge case',
      module: 'solar-calculations',
      method: 'POST',
      path: '/store/solar-calculations',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        consumo_kwh_mes: 150,
        uf: 'SC',
        tipo_instalacao: 'residencial',
        tipo_telhado: 'fibrocimento'
      },
      plgValidations: (data, plgStats) => {
        if (data.kits_recomendados) {
          plgStats.stage1_products_exposed += data.kits_recomendados.length;
        }
        return [];
      }
    },
    {
      name: 'Solar Calculation - High budget edge case',
      module: 'solar-calculations',
      method: 'POST',
      path: '/store/solar-calculations',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        consumo_kwh_mes: 300,
        uf: 'SP',
        tipo_instalacao: 'residencial',
        tipo_telhado: 'ceramico',
        orcamento_disponivel: 100000,
        prioridade_cliente: 'tecnologia'
      },
      plgValidations: (data, plgStats) => {
        if (data.kits_recomendados) {
          plgStats.stage1_products_exposed += data.kits_recomendados.length;
        }
        return [];
      }
    },
    {
      name: 'Solar Calculation - Missing fields error',
      module: 'solar-calculations',
      method: 'POST',
      path: '/store/solar-calculations',
      requiresAuth: true,
      expectedStatus: 400,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T'
      }
    },
    {
      name: 'Solar Calculation - Unauthorized error',
      module: 'solar-calculations',
      method: 'POST',
      path: '/store/solar-calculations',
      requiresAuth: false,
      testUnauth: true,
      expectedStatus: 401,
      body: {
        consumo_kwh_mes: 450,
        uf: 'SP'
      }
    }
  ],
  creditAnalysis: [
    {
      name: 'Credit Analysis - CDC modality',
      module: 'credit-analysis',
      method: 'POST',
      path: '/store/credit-analyses',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        requested_amount: 30000,
        installments_preference: 60,
        preferred_modality: 'CDC',
        monthly_income: 8000,
        current_debts: 1500
      },
      plgValidations: (data, plgStats) => {
        const validations = [];
        if (data.best_offers && data.best_offers.length > 0) {
          validations.push(`✓ PLG Stage 2: ${data.best_offers.length} financing offers generated`);
          plgStats.stage2_financing_offers += data.best_offers.length;
          data.best_offers.forEach(offer => {
            validations.push(`  - ${offer.modality}: ${offer.interest_rate_monthly}% monthly, R$ ${offer.monthly_payment}/month`);
          });
        }
        return validations;
      }
    },
    {
      name: 'Credit Analysis - LEASING modality',
      module: 'credit-analysis',
      method: 'POST',
      path: '/store/credit-analyses',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        requested_amount: 50000,
        installments_preference: 84,
        preferred_modality: 'LEASING',
        monthly_income: 12000,
        current_debts: 2000
      },
      plgValidations: (data, plgStats) => {
        if (data.best_offers) {
          plgStats.stage2_financing_offers += data.best_offers.length;
          return [`✓ PLG Stage 2: ${data.best_offers.length} financing offers`];
        }
        return [];
      }
    },
    {
      name: 'Credit Analysis - EAAS modality',
      module: 'credit-analysis',
      method: 'POST',
      path: '/store/credit-analyses',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        requested_amount: 80000,
        installments_preference: 120,
        preferred_modality: 'EAAS',
        monthly_income: 15000,
        current_debts: 3000
      },
      plgValidations: (data, plgStats) => {
        if (data.best_offers) {
          plgStats.stage2_financing_offers += data.best_offers.length;
          return [`✓ PLG Stage 2: ${data.best_offers.length} financing offers`];
        }
        return [];
      }
    },
    {
      name: 'Credit Analysis - High amount edge case',
      module: 'credit-analysis',
      method: 'POST',
      path: '/store/credit-analyses',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        requested_amount: 250000,
        installments_preference: 180,
        monthly_income: 30000,
        current_debts: 5000
      },
      plgValidations: (data, plgStats) => {
        if (data.best_offers) {
          plgStats.stage2_financing_offers += data.best_offers.length;
        }
        return [];
      }
    },
    {
      name: 'Credit Analysis - GET by ID',
      module: 'credit-analysis',
      method: 'GET',
      path: '/store/credit-analyses/analysis_01TEST',
      requiresAuth: true,
      expectedStatus: 404, // Will fail without real ID, expected behavior
    },
    {
      name: 'Credit Analysis - Missing fields error',
      module: 'credit-analysis',
      method: 'POST',
      path: '/store/credit-analyses',
      requiresAuth: true,
      expectedStatus: 400,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T'
      }
    },
    {
      name: 'Credit Analysis - Unauthorized error',
      module: 'credit-analysis',
      method: 'POST',
      path: '/store/credit-analyses',
      requiresAuth: false,
      testUnauth: true,
      expectedStatus: 401,
      body: {
        requested_amount: 30000
      }
    }
  ],
  financingApplications: [
    {
      name: 'Financing Application - CDC 60 months',
      module: 'financing-applications',
      method: 'POST',
      path: '/store/financing-applications',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        credit_analysis_id: 'analysis_placeholder',
        selected_offer_modality: 'CDC',
        installments: 60,
        principal_amount: 30000
      },
      plgValidations: (data, plgStats) => {
        const validations = [];
        if (data.payment_schedule && Array.isArray(data.payment_schedule)) {
          validations.push(`✓ PLG Stage 3: Payment schedule generated (${data.payment_schedule.length} installments)`);
          plgStats.stage3_payment_schedules++;
          if (data.payment_schedule.length > 0) {
            const first = data.payment_schedule[0];
            validations.push(`  - First: R$ ${first.total} (principal: ${first.principal}, interest: ${first.interest})`);
          }
        }
        return validations;
      }
    },
    {
      name: 'Financing Application - LEASING 84 months',
      module: 'financing-applications',
      method: 'POST',
      path: '/store/financing-applications',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        credit_analysis_id: 'analysis_placeholder',
        selected_offer_modality: 'LEASING',
        installments: 84,
        principal_amount: 50000
      },
      plgValidations: (data, plgStats) => {
        if (data.payment_schedule) {
          plgStats.stage3_payment_schedules++;
          return [`✓ PLG Stage 3: ${data.payment_schedule.length} installments generated`];
        }
        return [];
      }
    },
    {
      name: 'Financing Application - EAAS 120 months',
      module: 'financing-applications',
      method: 'POST',
      path: '/store/financing-applications',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        credit_analysis_id: 'analysis_placeholder',
        selected_offer_modality: 'EAAS',
        installments: 120,
        principal_amount: 80000
      },
      plgValidations: (data, plgStats) => {
        if (data.payment_schedule) {
          plgStats.stage3_payment_schedules++;
          return [`✓ PLG Stage 3: ${data.payment_schedule.length} installments generated`];
        }
        return [];
      }
    },
    {
      name: 'Financing Application - 360 months edge case',
      module: 'financing-applications',
      method: 'POST',
      path: '/store/financing-applications',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        credit_analysis_id: 'analysis_placeholder',
        selected_offer_modality: 'EAAS',
        installments: 360,
        principal_amount: 200000
      },
      plgValidations: (data, plgStats) => {
        const validations = [];
        if (data.payment_schedule && data.payment_schedule.length === 360) {
          validations.push(`✓ PLG Stage 3: 360-month payment schedule generated (performance target < 1s)`);
          plgStats.stage3_payment_schedules++;
        }
        return validations;
      }
    },
    {
      name: 'Financing Application - GET by ID',
      module: 'financing-applications',
      method: 'GET',
      path: '/store/financing-applications/app_01TEST',
      requiresAuth: true,
      expectedStatus: 404,
    },
    {
      name: 'Financing Application - Missing fields error',
      module: 'financing-applications',
      method: 'POST',
      path: '/store/financing-applications',
      requiresAuth: true,
      expectedStatus: 400,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T'
      }
    },
    {
      name: 'Financing Application - Unauthorized error',
      module: 'financing-applications',
      method: 'POST',
      path: '/store/financing-applications',
      requiresAuth: false,
      testUnauth: true,
      expectedStatus: 401,
      body: {
        principal_amount: 30000
      }
    }
  ],
  orderFulfillment: [
    {
      name: 'Order Fulfillment - Shipped status',
      module: 'order-fulfillment',
      method: 'POST',
      path: '/store/order-fulfillment',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        order_id: 'order_placeholder',
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        financing_application_id: 'app_placeholder',
        fulfillment_status: 'shipped'
      },
      plgValidations: (data, plgStats) => {
        const validations = [];
        if (data.picked_items && Array.isArray(data.picked_items)) {
          validations.push(`✓ PLG Stage 4: ${data.picked_items.length} items with product enrichment`);
        }
        if (data.shipments && data.shipments.length > 0) {
          const shipment = data.shipments[0];
          if (shipment.tracking_events) {
            validations.push(`✓ PLG Stage 4: Tracking events exposed (${shipment.tracking_events.length} events)`);
            plgStats.stage4_tracking_events += shipment.tracking_events.length;
          }
        }
        return validations;
      }
    },
    {
      name: 'Order Fulfillment - Multiple shipments',
      module: 'order-fulfillment',
      method: 'POST',
      path: '/store/order-fulfillment',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        order_id: 'order_placeholder_2',
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        financing_application_id: 'app_placeholder',
        fulfillment_status: 'shipped'
      },
      plgValidations: (data, plgStats) => {
        if (data.shipments) {
          data.shipments.forEach(s => {
            if (s.tracking_events) plgStats.stage4_tracking_events += s.tracking_events.length;
          });
        }
        return [];
      }
    },
    {
      name: 'Order Fulfillment - Picking status',
      module: 'order-fulfillment',
      method: 'POST',
      path: '/store/order-fulfillment',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        order_id: 'order_placeholder_3',
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T',
        fulfillment_status: 'picking'
      }
    },
    {
      name: 'Order Fulfillment - GET by ID',
      module: 'order-fulfillment',
      method: 'GET',
      path: '/store/order-fulfillment/fulfill_01TEST',
      requiresAuth: true,
      expectedStatus: 404,
    },
    {
      name: 'Order Fulfillment - Missing fields error',
      module: 'order-fulfillment',
      method: 'POST',
      path: '/store/order-fulfillment',
      requiresAuth: true,
      expectedStatus: 400,
      body: {
        customer_id: 'cust_01JJZM5K3XWCQY8FVHM2N0PG7T'
      }
    },
    {
      name: 'Order Fulfillment - Unauthorized error',
      module: 'order-fulfillment',
      method: 'POST',
      path: '/store/order-fulfillment',
      requiresAuth: false,
      testUnauth: true,
      expectedStatus: 401,
      body: {
        order_id: 'order_placeholder'
      }
    }
  ]
};

// Generate report
function generateReport() {
  console.log('\n\n' + '='.repeat(80));
  console.log('PLG STRATEGY 360° - HTTP TEST EXECUTION REPORT');
  console.log('='.repeat(80));
  console.log(`\nExecution Date: ${new Date().toISOString()}`);
  console.log(`Total Duration: ${results.summary.totalDuration}ms (${(results.summary.totalDuration / 1000).toFixed(2)}s)`);
  console.log(`\nTest Summary:`);
  console.log(`  ✅ Passed: ${results.summary.passed}/${results.summary.total}`);
  console.log(`  ❌ Failed: ${results.summary.failed}/${results.summary.total}`);
  console.log(`  ⏭️  Skipped: ${results.summary.skipped}/${results.summary.total}`);
  console.log(`  📊 Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

  console.log('\n' + '-'.repeat(80));
  console.log('PLG VALIDATION SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Stage 1 - Solar Calculator → Kit Recommendations:`);
  console.log(`  🎯 Products Exposed: ${results.plgValidations.stage1_products_exposed} product_id's`);
  console.log(`\nStage 2 - Credit Analysis → Financing Offers:`);
  console.log(`  💰 Financing Offers: ${results.plgValidations.stage2_financing_offers} offers generated`);
  console.log(`\nStage 3 - Financing Application → Payment Schedule:`);
  console.log(`  📅 Payment Schedules: ${results.plgValidations.stage3_payment_schedules} schedules generated`);
  console.log(`\nStage 4 - Order Fulfillment → Tracking:`);
  console.log(`  📦 Tracking Events: ${results.plgValidations.stage4_tracking_events} events exposed`);

  console.log('\n' + '-'.repeat(80));
  console.log('PERFORMANCE ANALYSIS');
  console.log('-'.repeat(80));

  const avgDuration = results.summary.totalDuration / results.tests.length;
  const maxDuration = Math.max(...results.tests.map(t => t.duration));
  const minDuration = Math.min(...results.tests.map(t => t.duration));

  console.log(`Average Response Time: ${avgDuration.toFixed(2)}ms`);
  console.log(`Min Response Time: ${minDuration}ms`);
  console.log(`Max Response Time: ${maxDuration}ms`);

  const slowTests = results.tests.filter(t => t.duration > 3000);
  if (slowTests.length > 0) {
    console.log(`\n⚠️  Slow Tests (>3s):`);
    slowTests.forEach(t => {
      console.log(`  - ${t.name}: ${t.duration}ms`);
    });
  }

  console.log('\n' + '-'.repeat(80));
  console.log('DETAILED TEST RESULTS');
  console.log('-'.repeat(80));

  ['solar-calculations', 'credit-analysis', 'financing-applications', 'order-fulfillment'].forEach(module => {
    const moduleTests = results.tests.filter(t => t.module === module);
    if (moduleTests.length > 0) {
      console.log(`\n📦 ${module.toUpperCase()}`);
      moduleTests.forEach(test => {
        const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
        console.log(`${icon} ${test.name}`);
        console.log(`   Status: ${test.statusCode || 'N/A'} | Duration: ${test.duration}ms`);
        if (test.error) {
          console.log(`   Error: ${test.error}`);
        }
        if (test.validations.length > 0) {
          test.validations.forEach(v => console.log(`   ${v}`));
        }
      });
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('END OF REPORT');
  console.log('='.repeat(80) + '\n');
}

// Main execution
async function main() {
  console.log('🚀 Starting PLG Strategy 360° HTTP Test Suite\n');

  try {
    // Setup authentication
    const auth = await setupAuthentication();

    console.log('\n' + '='.repeat(80));
    console.log('EXECUTING 27 HTTP TESTS SEQUENTIALLY');
    console.log('='.repeat(80) + '\n');

    // Execute all test suites sequentially
    console.log('📋 Stage 1: Solar Calculations (7 tests)');
    for (const test of testSuites.solarCalculations) {
      await executeTest(test, auth);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
    }

    console.log('\n📋 Stage 2: Credit Analysis (7 tests)');
    for (const test of testSuites.creditAnalysis) {
      await executeTest(test, auth);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📋 Stage 3: Financing Applications (7 tests)');
    for (const test of testSuites.financingApplications) {
      await executeTest(test, auth);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📋 Stage 4: Order Fulfillment (6 tests)');
    for (const test of testSuites.orderFulfillment) {
      await executeTest(test, auth);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Generate final report
    generateReport();

    // Exit with appropriate code
    process.exit(results.summary.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Fatal error during test execution:');
    console.error(error);
    process.exit(1);
  }
}

main();
