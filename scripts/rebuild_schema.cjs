const fs = require('fs');
const path = require('path');

const migrationsDir = 'c:\\Users\\slabl\\reservatoo-saas\\supabase\\migrations';
const outputFile = path.join(migrationsDir, '20260101000000_initial_schema.sql');

const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && f !== '20260101000000_initial_schema.sql')
    .sort();

let combinedContent = '';

for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Filter out useless comments
    content = content.replace(/\/\* (START|END): .* \*\//g, '');
    
    combinedContent += `-- Source: ${file}\n${content}\n\n`;
}

// Also remove the "Consolidated" blocks if they somehow got into the constituent files (unlikely but good for safety)
combinedContent = combinedContent.replace(/-- (Consolidated|Duplicate)[\s\S]*?\/\*[\s\S]*?\*\//g, '');

fs.writeFileSync(outputFile, combinedContent);
console.log(`Rebuilt ${outputFile} from ${files.length} files.`);
