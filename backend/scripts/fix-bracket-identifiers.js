const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all validators.ts and query-config.ts files
const files = glob.sync('src/api/**/{validators,query-config}.ts', { cwd: __dirname + '/..' });

let fixed = 0;

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  
  // Fix bracket identifiers like [id], [category], [employeeId], etc.
  content = content.replace(/\[id\]/g, 'Id');
  content = content.replace(/\[category\]/g, 'Category');
  content = content.replace(/\[employeeId\]/g, 'EmployeeId');
  content = content.replace(/\[customerGroupId\]/g, 'CustomerGroupId');
  content = content.replace(/\[company_id\]/g, 'CompanyId');
  content = content.replace(/\[customer_id\]/g, 'CustomerId');
  content = content.replace(/\[quote_id\]/g, 'QuoteId');
  content = content.replace(/\[sku\]/g, 'Sku');
  content = content.replace(/\[filename\]/g, 'Filename');
  
  // Fix hyphenated identifiers
  content = content.replace(/approval-settings/g, 'approvalSettings');
  content = content.replace(/customer-group/g, 'customerGroup');
  content = content.replace(/import-catalog/g, 'importCatalog');
  content = content.replace(/calculate-savings/g, 'calculateSavings');
  content = content.replace(/credit-analysis/g, 'creditAnalysis');
  content = content.replace(/credit-analyses/g, 'creditAnalyses');
  content = content.replace(/validate-mppt/g, 'validateMppt');
  content = content.replace(/financing-applications/g, 'financingApplications');
  content = content.replace(/internal-catalog/g, 'internalCatalog');
  content = content.replace(/ask-helio/g, 'askHelio');
  content = content.replace(/recommend-products/g, 'recommendProducts');
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed: ${file}`);
    fixed++;
  }
});

console.log(`\nTotal files fixed: ${fixed}`);
