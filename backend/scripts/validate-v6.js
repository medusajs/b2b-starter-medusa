#!/usr/bin/env node
/**
 * 🔍 BACKEND MEGA PROMPT V6 - Validation Script
 * Quick validation of all V6 implementations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function exec(command, silent = false) {
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function checkFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  return fs.existsSync(fullPath);
}

async function main() {
  log('\n🔍 BACKEND MEGA PROMPT V6 - Validation\n', 'blue');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // ============================================================================
  // 1. Check Modified Files
  // ============================================================================
  log('📁 Checking modified files...', 'yellow');
  
  const modifiedFiles = [
    'src/api/financing/simulate/route.ts',
    'src/api/pvlib/stats/route.ts',
    'src/api/pvlib/validate-mppt/route.ts',
    'src/api/admin/approvals/route.ts',
    'src/api/admin/financing/route.ts',
    'src/api/admin/quotes/route.ts',
    'src/api/middlewares.ts',
    'src/utils/logger.ts',
    'src/modules/pvlib-integration/service.ts',
    'integration-tests/setup-enhanced.js',
  ];

  let filesOk = true;
  for (const file of modifiedFiles) {
    if (checkFile(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file} - NOT FOUND`, 'red');
      filesOk = false;
    }
  }

  if (filesOk) {
    results.passed++;
    log('✅ All modified files present\n', 'green');
  } else {
    results.failed++;
    log('❌ Some files missing\n', 'red');
  }

  // ============================================================================
  // 2. Check Created Files
  // ============================================================================
  log('📦 Checking created files...', 'yellow');
  
  const createdFiles = [
    'pact/fixtures/catalog.ts',
    'pact/fixtures/quotes.ts',
    'BACKEND_MEGA_PROMPT_V6_PLAN.md',
    'BACKEND_MEGA_PROMPT_V6_SUMMARY.md',
    'BACKEND_MEGA_PROMPT_V6_PATCHES.md',
    'BACKEND_MEGA_PROMPT_V6_VALIDATION.md',
    'BACKEND_MEGA_PROMPT_V6_COMPLETE.md',
  ];

  let createdOk = true;
  for (const file of createdFiles) {
    if (checkFile(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file} - NOT FOUND`, 'red');
      createdOk = false;
    }
  }

  if (createdOk) {
    results.passed++;
    log('✅ All created files present\n', 'green');
  } else {
    results.failed++;
    log('❌ Some files missing\n', 'red');
  }

  // ============================================================================
  // 3. TypeScript Typecheck
  // ============================================================================
  log('🔍 Running TypeScript typecheck...', 'yellow');
  const typecheckResult = exec('npm run typecheck', true);
  
  if (typecheckResult.success) {
    results.passed++;
    log('✅ Typecheck passed\n', 'green');
  } else {
    results.failed++;
    log('❌ Typecheck failed\n', 'red');
    log(typecheckResult.error, 'red');
  }

  // ============================================================================
  // 4. Check Imports
  // ============================================================================
  log('📦 Checking imports...', 'yellow');
  
  const importChecks = [
    {
      file: 'src/api/financing/simulate/route.ts',
      imports: ['APIResponse', 'APIVersionManager'],
    },
    {
      file: 'src/api/pvlib/stats/route.ts',
      imports: ['APIResponse', 'APIVersionManager'],
    },
    {
      file: 'src/api/middlewares.ts',
      imports: ['requestIdMiddleware', 'apiVersionMiddleware', 'rateLimiter', 'loggerMiddleware'],
    },
  ];

  let importsOk = true;
  for (const check of importChecks) {
    const filePath = path.join(__dirname, '..', check.file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const imp of check.imports) {
        if (content.includes(imp)) {
          log(`  ✅ ${check.file} imports ${imp}`, 'green');
        } else {
          log(`  ❌ ${check.file} missing import ${imp}`, 'red');
          importsOk = false;
        }
      }
    }
  }

  if (importsOk) {
    results.passed++;
    log('✅ All imports present\n', 'green');
  } else {
    results.failed++;
    log('❌ Some imports missing\n', 'red');
  }

  // ============================================================================
  // 5. Check Middleware Chain
  // ============================================================================
  log('🔗 Checking middleware chain...', 'yellow');
  
  const middlewaresPath = path.join(__dirname, '..', 'src/api/middlewares.ts');
  if (fs.existsSync(middlewaresPath)) {
    const content = fs.readFileSync(middlewaresPath, 'utf-8');
    
    const checks = [
      { name: 'requestIdMiddleware', present: content.includes('requestIdMiddleware') },
      { name: 'loggerMiddleware', present: content.includes('loggerMiddleware') },
      { name: 'apiVersionMiddleware', present: content.includes('apiVersionMiddleware()') },
      { name: 'publicRateLimiter', present: content.includes('publicRateLimiter') },
    ];

    let chainOk = true;
    for (const check of checks) {
      if (check.present) {
        log(`  ✅ ${check.name} in chain`, 'green');
      } else {
        log(`  ❌ ${check.name} missing from chain`, 'red');
        chainOk = false;
      }
    }

    if (chainOk) {
      results.passed++;
      log('✅ Middleware chain complete\n', 'green');
    } else {
      results.failed++;
      log('❌ Middleware chain incomplete\n', 'red');
    }
  } else {
    results.failed++;
    log('❌ middlewares.ts not found\n', 'red');
  }

  // ============================================================================
  // 6. Check PVLib Timeout DI
  // ============================================================================
  log('⏱️  Checking PVLib timeout DI...', 'yellow');
  
  const pvlibPath = path.join(__dirname, '..', 'src/modules/pvlib-integration/service.ts');
  if (fs.existsSync(pvlibPath)) {
    const content = fs.readFileSync(pvlibPath, 'utf-8');
    
    const checks = [
      { name: 'PVLibServiceOptions interface', present: content.includes('export interface PVLibServiceOptions') },
      { name: 'requestTimeout property', present: content.includes('requestTimeout?: number') },
      { name: 'cacheTTL property', present: content.includes('cacheTTL?: number') },
      { name: 'constructor options', present: content.includes('constructor(options?: PVLibServiceOptions)') },
    ];

    let pvlibOk = true;
    for (const check of checks) {
      if (check.present) {
        log(`  ✅ ${check.name}`, 'green');
      } else {
        log(`  ❌ ${check.name} missing`, 'red');
        pvlibOk = false;
      }
    }

    if (pvlibOk) {
      results.passed++;
      log('✅ PVLib timeout DI implemented\n', 'green');
    } else {
      results.failed++;
      log('❌ PVLib timeout DI incomplete\n', 'red');
    }
  } else {
    results.failed++;
    log('❌ PVLib service not found\n', 'red');
  }

  // ============================================================================
  // Summary
  // ============================================================================
  log('\n' + '='.repeat(60), 'blue');
  log('📊 VALIDATION SUMMARY', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`⚠️  Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green');

  const total = results.passed + results.failed;
  const percentage = Math.round((results.passed / total) * 100);

  log(`\n📈 Success Rate: ${percentage}%\n`, percentage === 100 ? 'green' : 'yellow');

  if (results.failed === 0) {
    log('🎉 All validations passed! V6 implementation is complete.\n', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some validations failed. Please review the errors above.\n', 'red');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Validation script error: ${error.message}\n`, 'red');
  process.exit(1);
});
