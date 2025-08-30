/**
 * Servidor Principal - KeyControl Manager
 * 
 * Sistema de gerenciamento de chaves e salas com autenticação JWT.
 * 
 * @author Adimael Santos da Silva
 * @github github.com/adimael
 * @description Sistema de gerenciamento de chaves e salas
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Importar rotas
import rotasAuth from './routes/auth.js';
import rotasSalas from './routes/salas.js';

// Importar middlewares
import { autenticarToken } from './middleware/auth.js';
import tratadorErros from './middleware/errorHandler.js';
import { testarConexao } from './database/connection.js';

dotenv.config();

const app = express();
const PORTA = process.env.PORT || 3001;

// ====================== MIDDLEWARES DE SEGURANÇA ======================

// Helmet para headers de segurança
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limitador = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { erro: 'Muitas requisições. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limitador);

// CORS
const opcoesCors = {
  origin: function (origin, callback) {
    const origensPermitidas = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
    if (!origin || origensPermitidas.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(opcoesCors));

// ====================== MIDDLEWARES DE PARSING ======================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ====================== ROTAS ======================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    servico: 'API Backend KeyControl',
    versao: '2.2.1',
    ambiente: process.env.NODE_ENV
  });
});

// Rotas públicas
app.use('/api/auth', rotasAuth);

// Rotas protegidas
app.use('/api/salas', autenticarToken, rotasSalas);

// 404 - Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    sucesso: false,
    erro: 'Rota não encontrada',
    caminho: req.originalUrl,
    metodo: req.method
  });
});

// Tratador de erros global
app.use(tratadorErros);

// ====================== INICIALIZAÇÃO DO SERVIDOR ======================

async function iniciarServidor() {
  try {
    // Testar conexão com banco
    const bancoConectado = await testarConexao();
    if (!bancoConectado) {
      throw new Error('Falha ao conectar com banco de dados');
    }

    // Iniciar servidor
    app.listen(PORTA, () => {
      console.log('🚀 ===============================================');
      console.log(`🚀 Servidor KeyControl rodando na porta ${PORTA}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`💾 Banco: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
      console.log(`🔐 JWT expira em: ${process.env.JWT_EXPIRES_IN}`);
      console.log(`🌐 CORS: ${process.env.ALLOWED_ORIGINS}`);
      console.log('🚀 ===============================================');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

// Tratamento de sinais do sistema
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

// Iniciar aplicação
iniciarServidor();

export default app;