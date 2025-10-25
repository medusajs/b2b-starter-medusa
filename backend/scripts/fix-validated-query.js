const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/api/**/route.ts', { cwd: __dirname + '/..' });

let fixed = 0;

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  
  // Replace req.validatedQuery with req.query
  content = content.replace(/req\.validatedQuery/g, 'req.query');
  
  // Replace req.validatedBody with req.body
  content = content.replace(/req\.validatedBody/g, 'req.body');
  
  // Replace validatedParams with params
  content = content.replace(/req\.validatedParams/g, 'req.params');
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed: ${file}`);
    fixed++;
  }
});

console.log(`\nTotal files fixed: ${fixed}`);
