const fs = require('fs');
const path = 'c:\\Users\\slabl\\reservatoo-saas\\supabase\\migrations\\20260101000000_initial_schema.sql';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove START/END markers (redundant check)
content = content.replace(/\/\* (START|END): .* \*\//g, '');

// 2. Remove Source markers
content = content.replace(/-- Source: .*/g, '');

// 3. Remove large commented-out blocks (usually /* ... */ with multiple lines)
// We only want to remove blocks that contain SQL keywords, to avoid removing helpful doc comments.
content = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    if (match.includes('CREATE') || match.includes('ALTER') || match.includes('DROP') || match.includes('UPDATE') || match.includes('INSERT')) {
        return '';
    }
    return match; // Keep it if it's just a descriptive comment
});

// 4. Remove Consolidated/Duplicate markers
content = content.replace(/-- (Consolidated|Duplicate).*/g, '');

// 5. Remove multiple empty lines
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(path, content);
console.log('Cleaned unuseful comments and blocks.');
