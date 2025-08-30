/**
 * Rotas de Salas - KeyControl Manager
 * 
 * @author Adimael Santos da Silva
 * @github github.com/adimael
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { executarQuery, buscarUm, buscarVarios } from '../database/connection.js';
import { validarRequisicao, schemaRetirarChave } from '../middleware/validation.js';

const router = express.Router();

// GET /api/salas
router.get('/', async (req, res) => {
  try {
    const salas = await buscarVarios(`
      SELECT s.*, 
             mh.nome_pessoa as pessoa_chave_principal,
             bh.nome_pessoa as pessoa_chave_reserva
      FROM salas s
      LEFT JOIN historico_chaves mh ON s.id = mh.sala_id 
        AND mh.tipo_chave = 'principal' AND mh.devolvido = FALSE
      LEFT JOIN historico_chaves bh ON s.id = bh.sala_id 
        AND bh.tipo_chave = 'reserva' AND bh.devolvido = FALSE
      ORDER BY s.numero
    `);

    res.json({ sucesso: true, dados: salas });
  } catch (error) {
    console.error('❌ Erro ao listar salas:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro interno' });
  }
});

// POST /api/salas/:id/retirar-chave
router.post('/:id/retirar-chave', validarRequisicao(schemaRetirarChave), 
  async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_chave, nome_pessoa, observacoes } = req.body;
    const usuarioId = req.usuario.id;

    // Verificar se sala existe
    const sala = await buscarUm('SELECT * FROM salas WHERE id = ?', [id]);
    if (!sala) {
      return res.status(404).json({ sucesso: false, erro: 'Sala não encontrada' });
    }

    // Verificar disponibilidade
    const campoChave = tipo_chave === 'principal' ? 'disponivel' : 'chave_reserva_disponivel';
    if (sala[campoChave] !== 'Disponível') {
      return res.status(400).json({ sucesso: false, erro: 'Chave não disponível' });
    }

    // Registrar retirada
    const historicoId = uuidv4();
    await executarQuery(
      'INSERT INTO historico_chaves (id, sala_id, usuario_id, tipo_chave, nome_pessoa, observacoes) VALUES (?, ?, ?, ?, ?, ?)',
      [historicoId, id, usuarioId, tipo_chave, nome_pessoa, observacoes]
    );

    // Atualizar status da sala
    await executarQuery(
      `UPDATE salas SET ${campoChave} = 'Em uso' WHERE id = ?`,
      [id]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Chave retirada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao retirar chave:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro interno' });
  }
});

export default router;