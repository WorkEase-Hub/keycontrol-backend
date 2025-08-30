/**
 * Rotas de Autenticação - KeyControl Manager
 * 
 * @author Adimael Santos da Silva
 * @github github.com/adimael
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { buscarUm } from '../database/connection.js';
import { validarRequisicao, schemaLogin } from '../middleware/validation.js';
import { autenticarToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', validarRequisicao(schemaLogin), async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuário
    const usuario = await buscarUm(
      'SELECT * FROM usuarios WHERE username = ?',
      [username]
    );

    if (!usuario || !await bcrypt.compare(password, usuario.senha)) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Credenciais inválidas'
      });
    }

    // Gerar token
    const token = jwt.sign(
      { userId: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nivel_acesso: usuario.nivel_acesso
      },
      token
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro interno' });
  }
});

// POST /api/auth/verificar
router.post('/verificar', autenticarToken, (req, res) => {
  res.json({
    sucesso: true,
    usuario: req.usuario
  });
});

export default router;