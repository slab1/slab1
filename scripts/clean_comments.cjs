const fs = require('fs');
const path = 'c:\\Users\\slabl\\reservatoo-saas\\supabase\\migrations\\20260101000000_initial_schema.sql';
let content = fs.readFileSync(path, 'utf8');

// Regex to match:
// 1. -- Consolidated ... or -- Duplicate ...
// 2. Optional whitespace
// 3. /* ... */ block
const regex = /-- (Consolidated|Duplicate)[\s\S]*?\/\*[\s\S]*?\*\//g;

const newContent = content.replace(regex, (match) => {
    console.log('Removing block starting with:', match.split('\n')[0]);
    return '';
});

fs.writeFileSync(path, newContent);
