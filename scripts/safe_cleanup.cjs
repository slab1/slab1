const fs = require('fs');
const path = 'c:\\Users\\slabl\\reservatoo-saas\\supabase\\migrations\\20260101000000_initial_schema.sql';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove Source markers
content = content.replace(/^-- Source: .*$/gm, '');

// 2. Remove Consolidated/Duplicate markers and their following commented blocks
// We look for the marker, then optional whitespace, then a /* ... */ block
content = content.replace(/-- (Consolidated|Duplicate).*?(\r?\n\s*)?\/\*[\s\S]*?\*\//g, '');

// 3. Remove standalone Consolidated/Duplicate marker lines
content = content.replace(/^-- (Consolidated|Duplicate).*$/gm, '');

// 4. Remove multiple empty lines (3 or more -> 2)
content = content.replace(/(\r?\n){3,}/g, '\n\n');

fs.writeFileSync(path, content);
console.log('Cleaned unuseful markers and blocks.');
