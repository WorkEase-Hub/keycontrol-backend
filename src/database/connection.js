/**
 * Módulo de Conexão com Banco de Dados - KeyControl Manager
 * 
 * Este arquivo gerencia o pool de conexões MySQL para o sistema KeyControl.
 * Fornece funções para executar queries, buscar registros e gerenciar transações.
 * 
 * @author Adimael Santos da Silva
 * @github github.com/adimael
 * @description Sistema de gerenciamento de chaves e salas
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do pool de conexões MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

/**
 * Executa uma query SQL com parâmetros
 * @param {string} query - Query SQL a ser executada
 * @param {Array} params - Parâmetros para a query
 * @returns {Promise<Array>} Resultado da query
 */
export const executarQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Erro na execução da query:', error.message);
    throw error;
  }
};

/**
 * Busca um único registro
 * @param {string} query - Query SQL
 * @param {Array} params - Parâmetros
 * @returns {Promise<Object|null>} Primeiro resultado ou null
 */
export const buscarUm = async (query, params = []) => {
  try {
    const results = await executarQuery(query, params);
    return results[0] || null;
  } catch (error) {
    console.error('❌ Erro ao buscar registro único:', error.message);
    throw error;
  }
};

/**
 * Busca múltiplos registros
 * @param {string} query - Query SQL
 * @param {Array} params - Parâmetros
 * @returns {Promise<Array>} Array de resultados
 */
export const buscarVarios = async (query, params = []) => {
  try {
    const results = await executarQuery(query, params);
    return results;
  } catch (error) {
    console.error('❌ Erro ao buscar múltiplos registros:', error.message);
    throw error;
  }
};

/**
 * Testa a conexão com o banco de dados
 * @returns {Promise<boolean>} True se conexão bem-sucedida
 */
export const testarConexao = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexão com keycontrol_db estabelecida com sucesso');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco:', error.message);
    return false;
  }
};

/**
 * Fecha o pool de conexões gracefully
 */
export const fecharPool = async () => {
  await pool.end();
  console.log('🔌 Pool de conexões fechado');
};

export default pool;