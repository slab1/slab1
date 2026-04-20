const fs = require('fs');
const path = 'c:\\Users\\slabl\\reservatoo-saas\\supabase\\migrations\\20260101000000_initial_schema.sql';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove all single-line comments
content = content.replace(/^--.*$/gm, '');

// 2. Remove all multi-line comments that contain SQL keywords (junk code)
content = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    if (match.includes('CREATE') || match.includes('ALTER') || match.includes('DROP') || match.includes('UPDATE') || match.includes('INSERT')) {
        return '';
    }
    return ''; // Actually, user said ALL unuseful comments, let's just remove all /* */ comments too
});

// 3. Remove excessive empty lines
content = content.replace(/\n\s*\n/g, '\n');

// 4. Deduplicate functions (keep last occurrence)
const parts = content.split(/(?=CREATE OR REPLACE FUNCTION)/gi);
const finalParts = [];
const seenFunctions = new Set();

for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    const match = part.match(/CREATE OR REPLACE FUNCTION\s+(public\.\w+)/i);
    if (match) {
        const funcName = match[1].toLowerCase();
        if (!seenFunctions.has(funcName)) {
            finalParts.unshift(part);
            seenFunctions.add(funcName);
        }
    } else {
        finalParts.unshift(part);
    }
}

fs.writeFileSync(path, finalParts.join('\n').trim() + '\n');
console.log('Total cleanup complete.');
