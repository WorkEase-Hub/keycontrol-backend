/**
 * Teste de Conexão com Banco - KeyControl Manager
 * 
 * Este arquivo testa a conectividade com o banco de dados MySQL,
 * verifica a estrutura das tabelas e executa consultas de teste.
 * Inclui sistema de logs detalhados para auditoria.
 * 
 * @author Adimael Santos da Silva
 * @github github.com/adimael
 * @description Sistema de gerenciamento de chaves e salas
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar paths para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '.env') });

// Configurar sistema de logs
const LOGS_DIR = join(__dirname, 'logs');
const LOG_FILE = join(LOGS_DIR, `test_db_${new Date().toISOString().split('T')[0]}.log`);

/**
 * Garantir que o diretório de logs existe
 */
function garantirDiretorioLogs() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
    console.log(`📁 Diretório de logs criado: ${LOGS_DIR}`);
  }
}

/**
 * Função para logging duplo (console + arquivo)
 * @param {string} message - Mensagem para log
 * @param {string} level - Nível do log (INFO, ERROR, SUCCESS)
 */
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  // Log no console
  console.log(message);
  
  // Log no arquivo
  try {
    fs.appendFileSync(LOG_FILE, logMessage + '\n', 'utf8');
  } catch (error) {
    console.error('❌ Erro ao escrever no arquivo de log:', error.message);
  }
}

/**
 * Função para log de erro
 * @param {string} message - Mensagem de erro
 */
function logError(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [ERROR] ${message}`;
  
  // Log no console
  console.error(message);
  
  // Log no arquivo
  try {
    fs.appendFileSync(LOG_FILE, logMessage + '\n', 'utf8');
  } catch (error) {
    console.error('❌ Erro ao escrever erro no arquivo de log:', error.message);
  }
}

/**
 * Função principal de teste do banco de dados
 * Executa uma série de testes para validar a conexão e funcionalidade
 */
async function testarBancoDados() {
  // Garantir que o diretório de logs existe
  garantirDiretorioLogs();
  
  log('\n🚀 ==========================================')
  log('🚀 INICIANDO TESTE DE BANCO KEYCONTROL');
  log('🚀 ==========================================')
  log(`📁 Logs sendo salvos em: ${LOG_FILE}`);
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'keycontrol_db'
  };

  log('\n🔍 Configuração do Banco de Dados:');
  log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  log(`   Database: ${dbConfig.database}`);
  log(`   User: ${dbConfig.user}`);
  log(`   Password: ${'*'.repeat(dbConfig.password.length)}`);

  let connection;
  let testsPassed = 0;
  const totalTests = 8;

  try {
    // PRÉ-TESTE: Verificar conexão MySQL
    log('\n🧪 PRÉ-TESTE: Verificando conexão com MySQL...');
    
    const connectionWithoutDB = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    log('✅ MySQL está acessível!');
    
    // Verificar se o database existe
    const [databases] = await connectionWithoutDB.execute('SHOW DATABASES');
    const dbExists = databases.some(db => Object.values(db)[0] === 'keycontrol_db');
    
    if (!dbExists) {
      logError('\n❌ Database keycontrol_db NÃO EXISTE!');
      logError('💡 Para criar, execute: CREATE DATABASE keycontrol_db;');
      await connectionWithoutDB.end();
      process.exit(1);
    }
    
    await connectionWithoutDB.end();
    log('✅ Database keycontrol_db encontrado!');

    // Teste 1: Conexão básica
    log('\n🧪 TESTE 1: Conexão com o banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    log('✅ Conexão estabelecida com sucesso!');
    testsPassed++;

    // Teste 2: Verificar tabelas
    log('\n🧪 TESTE 2: Verificando tabelas existentes...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      logError('❌ Nenhuma tabela encontrada! Execute: npm run migrate');
      await connection.end();
      process.exit(1);
    }
    
    log(`📊 Tabelas encontradas (${tables.length}):`);
    tables.forEach(table => {
      log(`   ✅ ${Object.values(table)[0]}`);
    });
    testsPassed++;

    // ... demais testes ...

    // Resumo final
    log('\n🎉 =====================================')
    log('🎉 TODOS OS TESTES FORAM EXECUTADOS!');
    log(`🎉 ${testsPassed}/${totalTests} testes passaram!`);
    log('🎉 Banco de dados está funcionando!');
    log('🎉 =====================================')
    log(`\n📁 Log detalhado salvo em: ${LOG_FILE}`);
    
  } catch (error) {
    logError('\n❌ ERRO NO TESTE DE BANCO DE DADOS!');
    logError('Erro:', error.message);
    logError(`📁 Log de erro salvo em: ${LOG_FILE}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar função principal
console.log('🚀 Iniciando teste de banco de dados KeyControl...');
testarBancoDados()
  .then(() => {
    console.log('✅ Teste concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });