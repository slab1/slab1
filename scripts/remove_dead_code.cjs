const fs = require('fs');
const path = 'c:\\Users\\slabl\\reservatoo-saas\\supabase\\migrations\\20260101000000_initial_schema.sql';
let content = fs.readFileSync(path, 'utf8');

// Remove large commented-out blocks that contain SQL keywords
content = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    const upper = match.toUpperCase();
    if (upper.includes('CREATE') || upper.includes('ALTER') || upper.includes('DROP') || upper.includes('UPDATE') || upper.includes('INSERT') || upper.includes('SELECT')) {
        return '';
    }
    return match; // Keep descriptive comments
});

// Remove single-line comments that look like they were part of a consolidation
content = content.replace(/^-- .*uses master.*$/gm, '');
content = content.replace(/^-- .*Duplicate.*$/gm, '');

// Final cleanup of empty lines
content = content.replace(/(\r?\n){3,}/g, '\n\n');

fs.writeFileSync(path, content);
console.log('Removed commented-out code blocks.');
