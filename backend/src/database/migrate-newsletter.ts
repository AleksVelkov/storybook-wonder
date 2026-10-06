import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateNewsletter() {
  try {
    console.log('Starting newsletter table migration...');
    
    const schemaSQL = readFileSync(join(__dirname, 'newsletter-schema.sql'), 'utf-8');
    
    await pool.query(schemaSQL);
    
    console.log('✅ Newsletter table migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Newsletter migration failed:', error);
    process.exit(1);
  }
}

migrateNewsletter();


