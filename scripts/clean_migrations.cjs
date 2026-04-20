const fs = require('fs');
const path = require('path');

const migrationsDir = 'c:\\Users\\slabl\\reservatoo-saas\\supabase\\migrations';
const keepFile = '20260101000000_initial_schema.sql';

const files = fs.readdirSync(migrationsDir);

files.forEach(file => {
    if (file.endsWith('.sql') && file !== keepFile) {
        const filePath = path.join(migrationsDir, file);
        console.log(`Deleting redundant migration: ${file}`);
        fs.unlinkSync(filePath);
    }
});

console.log('Migrations directory cleaned.');
