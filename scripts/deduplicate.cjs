const fs = require('fs');
const path = 'c:\\Users\\slabl\\reservatoo-saas\\supabase\\migrations\\20260101000000_initial_schema.sql';
let content = fs.readFileSync(path, 'utf8');

// Regex to capture full function definitions
// This is tricky but we can try to match from CREATE OR REPLACE FUNCTION until the final $$;
const functionRegex = /CREATE OR REPLACE FUNCTION\s+(public\.\w+)\s*\(([\s\S]*?)\)[\s\S]*?AS \$\$([\s\S]*?)\$\$\s*(?:LANGUAGE \w+)?\s*(?:SECURITY \w+)?\s*(?:SET search_path = \w+)?\s*;/gi;

// We'll use a simpler approach: split by "CREATE OR REPLACE FUNCTION" and then process
const parts = content.split(/(?=CREATE OR REPLACE FUNCTION)/gi);
const uniqueFunctions = new Map();

const resultParts = parts.map(part => {
    const match = part.match(/CREATE OR REPLACE FUNCTION\s+(public\.\w+)/i);
    if (match) {
        const funcName = match[1].toLowerCase();
        // For simplicity, we'll keep the LAST occurrence of each function name
        // (assuming later ones are fixes/improvements)
        uniqueFunctions.set(funcName, part);
        return null; // Remove for now
    }
    return part; // Keep non-function parts (tables, etc.)
});

// Re-assemble
let finalContent = resultParts.filter(p => p !== null).join('');
// Append the unique functions at the end or where they were?
// Let's put them at the end for now, but better would be to keep them in place.
// Actually, let's just keep the last occurrence in its original place.

const finalParts = [];
const seenFunctions = new Set();
// Reverse to find the last occurrence easily
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

fs.writeFileSync(path, finalParts.join(''));
console.log(`Deduplicated functions. Kept ${seenFunctions.size} unique functions.`);
