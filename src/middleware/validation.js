/**
 * Middleware de Validação com Joi - KeyControl Manager
 * 
 * @author Adimael Santos da Silva
 * @github github.com/adimael
 */

import Joi from 'joi';

/**
 * Middleware genérico de validação
 */
export const validarRequisicao = (schema, fonte = 'body') => {
  return (req, res, next) => {
    const dados = req[fonte];
    const { error, value } = schema.validate(dados, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const erros = error.details.map(detail => ({
        campo: detail.path.join('.'),
        mensagem: detail.message
      }));

      return res.status(400).json({
        sucesso: false,
        erro: 'Dados de entrada inválidos',
        detalhes: erros
      });
    }

    req[fonte] = value;
    next();
  };
};

// Schemas de validação
export const schemaLogin = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

export const schemaCriarUsuario = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  nivel_acesso: Joi.string().valid('funcionario', 'administrador').default('funcionario')
});

export const schemaRetirarChave = Joi.object({
  tipo_chave: Joi.string().valid('principal', 'reserva').required(),
  nome_pessoa: Joi.string().min(2).required(),
  observacoes: Joi.string().allow('', null)
});