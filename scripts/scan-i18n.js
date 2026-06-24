import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryToScan = path.join(__dirname, '../src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(directoryToScan);

// Advanced regex to find text inside JSX tags (excludes children that are JSX components or JS expressions)
const jsxTextRegex = />([^<>{]+)</g;
// Regex to find string literals in common props
const propRegex = /(placeholder|label|title|aria-label)="([^"]*[a-zA-Z]+[^"]*)"/g;

let totalMatches = 0;

console.log('\n🔍 Scanning codebase for hardcoded English strings...\n');

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  
  const matches = [];

  // Match JSX Text
  let match;
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    // Ignore if it's just numbers, symbols, empty, or likely code
    if (
      text.length > 1 && 
      /[a-zA-Z]/.test(text) && 
      !text.startsWith('import ') && 
      !text.startsWith('export ') &&
      !/^[\d\s\W]+$/.test(text)
    ) {
      matches.push({ type: 'JSX Text', text });
    }
  }

  // Match Prop Strings
  while ((match = propRegex.exec(content)) !== null) {
    const text = match[2].trim();
    if (text.length > 1 && /[a-zA-Z]/.test(text)) {
      matches.push({ type: `Prop (${match[1]})`, text });
    }
  }

  if (matches.length > 0) {
    console.log(`📄 ${relativePath}`);
    matches.forEach(m => {
      console.log(`   [${m.type}] "${m.text}"`);
    });
    console.log('');
    totalMatches += matches.length;
  }
});

console.log(`📊 Summary: Found ${totalMatches} potential hardcoded strings.\n`);
console.log('💡 Tip: Extract these strings to /src/i18n.ts and use the useTranslation hook.\n');
