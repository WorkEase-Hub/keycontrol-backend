// test_db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    console.log('📊 Informações da conexão:');
    console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
    process.exit(1);
  }
}

testConnection();