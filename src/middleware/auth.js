/**
 * Middleware de Autenticação JWT - KeyControl Manager
 * 
 * @author Adimael Santos da Silva
 * @github github.com/adimael
 */

import jwt from 'jsonwebtoken';
import { buscarUm } from '../database/connection.js';

/**
 * Middleware para autenticar token JWT
 */
export const autenticarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await buscarUm(
      'SELECT id, username, nivel_acesso FROM usuarios WHERE id = ?',
      [decoded.userId]
    );

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Usuário não encontrado'
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ sucesso: false, erro: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ sucesso: false, erro: 'Token expirado' });
    }
    return res.status(500).json({ sucesso: false, erro: 'Erro interno' });
  }
};

/**
 * Middleware para verificar se usuário é administrador
 */
export const exigirAdmin = (req, res, next) => {
  if (req.usuario.nivel_acesso !== 'administrador') {
    return res.status(403).json({
      sucesso: false,
      erro: 'Acesso negado. Privilégios de administrador requeridos.'
    });
  }
  next();
};