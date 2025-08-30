/**
 * Middleware de Tratamento de Erros - KeyControl Manager
 * 
 * @author Adimael Santos da Silva
 * @github github.com/adimael
 */

/**
 * Middleware global de tratamento de erros
 */
const tratadorErros = (error, req, res, next) => {
  console.error('❌ Erro capturado:', {
    mensagem: error.message,
    stack: error.stack,
    url: req.url,
    metodo: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Erro de validação do Joi
  if (error.isJoi) {
    return res.status(400).json({
      sucesso: false,
      erro: 'Dados inválidos',
      detalhes: error.details
    });
  }

  // Erros do MySQL
  if (error.code) {
    switch (error.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json({
          sucesso: false,
          erro: 'Registro duplicado'
        });
      case 'ECONNREFUSED':
        return res.status(503).json({
          sucesso: false,
          erro: 'Serviço indisponível'
        });
    }
  }

  // Erro genérico
  return res.status(500).json({
    sucesso: false,
    erro: 'Erro interno do servidor'
  });
};

export default tratadorErros;