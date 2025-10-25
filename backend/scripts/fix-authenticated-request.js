const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/api/**/route.ts', { cwd: __dirname + '/..' });

let fixed = 0;

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  
  // Replace AuthenticatedMedusaRequest with MedusaRequest
  content = content.replace(/AuthenticatedMedusaRequest/g, 'MedusaRequest');
  
  // Ensure MedusaRequest is imported
  if (content.includes('MedusaRequest') && !content.includes('import') && !content.includes('MedusaRequest')) {
    // Add import if missing
    if (!content.match(/import.*MedusaRequest.*from.*@medusajs\/framework/)) {
      content = `import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";\n${content}`;
    }
  }
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed: ${file}`);
    fixed++;
  }
});

console.log(`\nTotal files fixed: ${fixed}`);
