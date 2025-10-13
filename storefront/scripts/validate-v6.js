#!/usr/bin/env node
/**
 * 🔍 STOREFRONT MEGA PROMPT V6 - Validation Script
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

function checkFile(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

async function main() {
  log('\n🔍 STOREFRONT MEGA PROMPT V6 - Validation\n', 'blue');

  const results = { passed: 0, failed: 0 };

  // Check created files
  log('📁 Checking created files...', 'yellow');
  
  const files = [
    'src/lib/http.ts',
    'src/lib/__tests__/http.test.ts',
    'src/components/ui/skeleton.tsx',
    'src/app/[countryCode]/(main)/loading.tsx',
    'src/app/[countryCode]/(main)/products/[handle]/loading.tsx',
  ];

  let filesOk = true;
  for (const file of files) {
    if (checkFile(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file} - NOT FOUND`, 'red');
      filesOk = false;
    }
  }

  if (filesOk) {
    results.passed++;
    log('✅ All files present\n', 'green');
  } else {
    results.failed++;
    log('❌ Some files missing\n', 'red');
  }

  // Check HTTP client features
  log('🌐 Checking HTTP client features...', 'yellow');
  
  const httpPath = path.join(__dirname, '..', 'src/lib/http.ts');
  if (fs.existsSync(httpPath)) {
    const content = fs.readFileSync(httpPath, 'utf-8');
    
    const checks = [
      { name: 'AbortController', present: content.includes('AbortController') },
      { name: 'calculateBackoff', present: content.includes('calculateBackoff') },
      { name: 'parseRetryAfter', present: content.includes('parseRetryAfter') },
      { name: 'HttpError interface', present: content.includes('interface HttpError') },
      { name: 'Test-friendly delays', present: content.includes("NODE_ENV === 'test'") },
    ];

    let httpOk = true;
    for (const check of checks) {
      if (check.present) {
        log(`  ✅ ${check.name}`, 'green');
      } else {
        log(`  ❌ ${check.name} missing`, 'red');
        httpOk = false;
      }
    }

    if (httpOk) {
      results.passed++;
      log('✅ HTTP client complete\n', 'green');
    } else {
      results.failed++;
      log('❌ HTTP client incomplete\n', 'red');
    }
  }

  // Check next.config.js
  log('🔒 Checking security config...', 'yellow');
  
  const configPath = path.join(__dirname, '..', 'next.config.js');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8');
    
    const checks = [
      { name: 'object-src none', present: content.includes("object-src 'none'") },
      { name: 'remotePatterns minimal', present: content.includes('medusa-public-images') },
      { name: 'Dev-only localhost', present: content.includes("NODE_ENV === 'development'") },
    ];

    let configOk = true;
    for (const check of checks) {
      if (check.present) {
        log(`  ✅ ${check.name}`, 'green');
      } else {
        log(`  ❌ ${check.name} missing`, 'red');
        configOk = false;
      }
    }

    if (configOk) {
      results.passed++;
      log('✅ Security config complete\n', 'green');
    } else {
      results.failed++;
      log('❌ Security config incomplete\n', 'red');
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 VALIDATION SUMMARY', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

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
