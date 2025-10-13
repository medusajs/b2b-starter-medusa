// Test script to verify resilience system integration
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🧪 Testing Resilience System Integration...\n');

// Check if key files exist and have expected content
const checks = [
  {
    file: 'src/components/error-boundary/error-boundary-resilient.tsx',
    contains: ['ErrorBoundaryResilient', 'context', 'fallbackMessage']
  },
  {
    file: 'src/components/toasts/toast-provider.tsx',
    contains: ['ToastProvider', 'useToast', 'maxToasts']
  },
  {
    file: 'src/lib/data/cart-resilient.ts',
    contains: ['CartResilientLayer', 'ResilientHttpClient', 'toast']
  },
  {
    file: 'src/modules/checkout/templates/checkout-form/index.tsx',
    contains: ['ErrorBoundaryResilient', 'context="checkout-form"']
  },
  {
    file: 'src/modules/checkout/templates/checkout-summary/index.tsx',
    contains: ['ErrorBoundaryResilient', 'context="checkout-summary"']
  }
];

let allPassed = true;

for (const check of checks) {
  try {
    const filePath = join(process.cwd(), check.file);
    const content = readFileSync(filePath, 'utf-8');

    const missing = check.contains.filter(text => !content.includes(text));
    if (missing.length > 0) {
      console.log(`❌ ${check.file}: Missing ${missing.join(', ')}`);
      allPassed = false;
    } else {
      console.log(`✅ ${check.file}: All checks passed`);
    }
  } catch (error) {
    console.log(`❌ ${check.file}: File not found or unreadable`);
    allPassed = false;
  }
}

console.log(`\n${allPassed ? '🎉' : '⚠️'} Resilience system integration ${allPassed ? 'PASSED' : 'FAILED'}`);