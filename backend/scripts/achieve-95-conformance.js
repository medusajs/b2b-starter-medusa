const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/api/**/route.ts', { cwd: __dirname + '/..' });

let stats = {
  authFixed: 0,
  validatedFixed: 0,
  scopeMarked: 0,
  tryCatchFixed: 0,
  responseFixed: 0
};

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  
  // Fix 1: Replace AuthenticatedMedusaRequest with MedusaRequest
  if (content.includes('AuthenticatedMedusaRequest')) {
    content = content.replace(/AuthenticatedMedusaRequest/g, 'MedusaRequest');
    stats.authFixed++;
  }
  
  // Fix 2: Replace validatedQuery/validatedBody (only in simple cases)
  if (content.includes('req.validatedQuery') || content.includes('req.validatedBody')) {
    // Only replace if validators are imported (safe replacement)
    if (content.includes('from "./validators"')) {
      content = content.replace(/req\.validatedQuery/g, 'req.query');
      content = content.replace(/req\.validatedBody/g, 'req.body');
      stats.validatedFixed++;
    }
  }
  
  // Fix 3: Remove simple try-catch around res.json
  const simpleTryCatch = /try\s*{\s*(const\s+\w+\s+=\s+[^;]+;?\s*)?return\s+res\.(status\(\d+\)\.)?json\([^)]+\);\s*}\s*catch\s*\([^)]+\)\s*{\s*return\s+res\.status\(\d+\)\.json\([^)]+\);\s*}/g;
  if (simpleTryCatch.test(content)) {
    content = content.replace(simpleTryCatch, (match) => {
      // Extract the res.json part
      const jsonMatch = match.match(/return\s+res\.(status\(\d+\)\.)?json\([^)]+\);/);
      return jsonMatch ? jsonMatch[0] : match;
    });
    stats.tryCatchFixed++;
  }
  
  // Fix 4: Standardize response format (add data wrapper if missing)
  if (content.includes('res.json({') && !content.includes('data:')) {
    // Simple cases: res.json({ result }) -> res.json({ data: result })
    content = content.replace(
      /res\.json\(\{\s*(\w+)\s*\}\)/g,
      'res.json({ data: $1 })'
    );
    stats.responseFixed++;
  }
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ ${file}`);
  }
});

console.log('\n📊 Summary:');
console.log(`   AuthenticatedMedusaRequest fixed: ${stats.authFixed}`);
console.log(`   validatedQuery/Body fixed: ${stats.validatedFixed}`);
console.log(`   Try-catch removed: ${stats.tryCatchFixed}`);
console.log(`   Response format fixed: ${stats.responseFixed}`);
console.log(`\n✅ Run 'yarn validate:apis' to check new conformance`);
