import bcrypt from 'bcrypt';

import {
  addProfessor,
  getProfessores,
  updateProfessor as updateProfessorRecord,
} from '../services/storageService.js';

/* =========================
   LISTAR PROFESSORES
========================= */

export async function listProfessores(req, res) {
  try {
    const professores = await getProfessores();

    res.json(professores);
  } catch (error) {
    console.error('Erro ao buscar professores:', error);

    res.status(500).json({
      error: 'Erro ao buscar professores.',
    });
  }
}

/* =========================
   CRIAR PROFESSOR
========================= */

export async function createProfessor(req, res) {
  try {
    const professor = req.body;

    if (
      !professor ||
      typeof professor !== 'object' ||
      !professor.nome ||
      typeof professor.nome !== 'string' ||
      !professor.nome.trim() ||
      !professor.email ||
      !professor.senha
    ) {
      return res.status(400).json({
        error: 'Dados de professor inválidos.',
      });
    }

    // 🔐 Criptografa a senha antes de salvar no PostgreSQL
    const senhaHash = await bcrypt.hash(professor.senha, 10);

    const novoProfessor = await addProfessor({
      ...professor,
      nome: professor.nome.trim(),
      senha: senhaHash,
    });

    res.status(201).json(novoProfessor);
  } catch (error) {
    console.error('Erro ao criar professor:', error);

    res.status(500).json({
      error: 'Erro ao criar professor.',
    });
  }
}

/* =========================
   ATUALIZAR PROFESSOR
========================= */

export async function updateProfessor(req, res) {
  try {
    const { id } = req.params;
    const professor = req.body;

    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({
        error: 'ID de professor inválido.',
      });
    }

    if (
      !professor ||
      typeof professor !== 'object'
    ) {
      return res.status(400).json({
        error: 'Dados de professor inválidos.',
      });
    }

    const dadosAtualizados = {
      ...professor,
    };

    // 🔐 Só gera novo hash se uma nova senha foi enviada
    if (professor.senha) {
      dadosAtualizados.senha = await bcrypt.hash(
        professor.senha,
        10
      );
    }

    const atualizado = await updateProfessorRecord(
      id,
      dadosAtualizados
    );

    if (!atualizado) {
      return res.status(404).json({
        error: 'Professor não encontrado.',
      });
    }

    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);

    res.status(500).json({
      error: 'Erro ao atualizar professor.',
    });
  }
}