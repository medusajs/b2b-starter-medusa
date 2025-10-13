// Test script to verify resilience system integration// Test script to verify resilience system integration

import { readFileSync } from 'fs';import { readFileSync } from 'fs';

import { join } from 'path';import { join } from 'path';



console.log('🧪 Testing Resilience System Integration...\n');console.log('🧪 Testing Resilience System Integration...\n');



// Check if key files exist and have expected content// Check if key files exist and have expected content

const checks = [const checks = [

  {    {

    file: 'src/components/error-boundary/error-boundary-resilient.tsx',        file: 'src/components/error-boundary/error-boundary-resilient.tsx',

    contains: ['ErrorBoundaryResilient', 'context', 'fallback']        contains: ['ErrorBoundaryResilient', 'context', 'fallback']

  },    },

  {    {

    file: 'src/components/toasts/toast-provider.tsx',        file: 'src/components/toasts/toast-provider.tsx',

    contains: ['ToastProvider', 'useToast', 'maxToasts']        contains: ['ToastProvider', 'useToast', 'maxToasts']

  },    },

  {    {

    file: 'src/lib/data/cart-resilient.ts',        file: 'src/lib/data/cart-resilient.ts',

    contains: ['cartResilience', 'cartToastDispatcher']        contains: ['cartResilience', 'cartToastDispatcher', 'ResilientHttpClient']

  },    },

  {    {

    file: 'src/modules/checkout/templates/checkout-form/index.tsx',        file: 'src/modules/checkout/templates/checkout-form/index.tsx',

    contains: ['ErrorBoundaryResilient', 'context="checkout-form"']        contains: ['ErrorBoundaryResilient', 'context="checkout-form"']

  },    },

  {    {

    file: 'src/modules/checkout/templates/checkout-summary/index.tsx',        file: 'src/modules/checkout/templates/checkout-summary/index.tsx',

    contains: ['ErrorBoundaryResilient', 'context="checkout-summary"']        contains: ['ErrorBoundaryResilient', 'context="checkout-summary"']

  }    }

];];



let allPassed = true;let allPassed = true;



for (const check of checks) {for (const check of checks) {

  try {    try {

    const filePath = join(process.cwd(), check.file);        const filePath = join(process.cwd(), check.file);

    const content = readFileSync(filePath, 'utf-8');        const content = readFileSync(filePath, 'utf-8');



    const missing = check.contains.filter(text => !content.includes(text));        const missing = check.contains.filter(text => !content.includes(text));

    if (missing.length > 0) {        if (missing.length > 0) {

      console.log(`❌ ${check.file}: Missing ${missing.join(', ')}`);            console.log(`❌ ${check.file}: Missing ${missing.join(', ')}`);

      allPassed = false;            allPassed = false;

    } else {        } else {

      console.log(`✅ ${check.file}: All checks passed`);            console.log(`✅ ${check.file}: All checks passed`);

    }        }

  } catch (error) {    } catch (error) {

    console.log(`❌ ${check.file}: File not found or unreadable`);        console.log(`❌ ${check.file}: File not found or unreadable`);

    allPassed = false;        allPassed = false;

  }    }

}}



console.log(`\n${allPassed ? '🎉' : '⚠️'} Resilience system integration ${allPassed ? 'PASSED' : 'FAILED'}`);console.log(`\n${allPassed ? '🎉' : '⚠️'} Resilience system integration ${allPassed ? 'PASSED' : 'FAILED'}`);