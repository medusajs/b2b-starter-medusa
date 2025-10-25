const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/api/**/route.ts', { cwd: __dirname + '/..' });

let fixed = 0;

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  
  // Add comment for manual review where req.scope.resolve is used
  if (content.includes('req.scope.resolve')) {
    // Replace common patterns
    content = content.replace(
      /const\s+(\w+)\s+=\s+req\.scope\.resolve\(['"]([\w-]+)['"]\)/g,
      'const $1 = req.scope.resolve("$2") // TODO: Use dependency injection'
    );
    
    // Mark file as needing review
    if (!content.includes('// TODO: Use dependency injection')) {
      content = content.replace(
        /req\.scope\.resolve/g,
        'req.scope.resolve // TODO: Use dependency injection'
      );
    }
  }
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Marked for review: ${file}`);
    fixed++;
  }
});

console.log(`\nTotal files marked: ${fixed}`);
console.log('\nNote: req.scope.resolve requires manual review for proper dependency injection.');
