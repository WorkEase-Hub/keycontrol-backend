import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbName = process.env.DB_NAME || 'keycontrol_db';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function runMigration() {
  let connection;

  try {
    console.log('🚀 Starting database migration...');

    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`📂 Database '${dbName}' ready`);

    // Use the database
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`📂 Using database '${dbName}'`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Executing database schema...');
    await connection.query(schema);

    console.log('✅ Database migration completed successfully!');
    console.log('📊 Database:', dbName);
    console.log('🏢 Admin user created with username: admin, password: admin');
    console.log('🚪 Sample rooms and people have been created');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run migration if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration();
}

export default runMigration;
