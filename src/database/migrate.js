/**
 * Sistema de Migração do Banco de Dados - KeyControl Manager
 * 
 * Este arquivo executa as migrações do banco de dados, criando tabelas
 * e inserindo dados iniciais necessários para o funcionamento do sistema.
 * 
 * @author Adimael Santos da Silva
 * @github github.com/adimael
 * @description Sistema de gerenciamento de chaves e salas
 */

import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Executa a migração do banco de dados
 */
async function executarMigracao() {
  try {
    console.log('🗄️ Iniciando migração do banco de dados KeyControl...');
    
    // Conectar ao banco
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });
    
    // Ler e executar schema
    const schema = fs.readFileSync('./src/database/schema.sql', 'utf8');
    await connection.query(schema);
    
    console.log('✅ Migração executada com sucesso!');
    console.log('📊 Tabelas criadas: usuarios, salas, pessoas, historico_chaves');
    console.log('👤 Usuário admin padrão criado (admin/admin123)');
    console.log('🏠 5 salas de exemplo inseridas');
    console.log('👥 4 pessoas de exemplo inseridas');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarMigracao();
}

export default executarMigracao;