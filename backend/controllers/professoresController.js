import bcrypt from 'bcrypt';

import {
  addProfessor,
  getProfessores,
  updateProfessor as updateProfessorRecord,
} from '../services/storageService.js';

/* =========================
   REMOVER DADOS SENSÍVEIS
========================= */

function professorSeguro(professor) {
  if (!professor) {
    return professor;
  }

  const {
    senha: _senha,
    ...dadosSeguros
  } = professor;

  return dadosSeguros;
}

/* =========================
   LISTAR PROFESSORES
========================= */

export async function listProfessores(req, res) {
  try {
    const professores = await getProfessores();

    const professoresSeguros =
      Array.isArray(professores)
        ? professores.map(professorSeguro)
        : [];

    return res.json(professoresSeguros);

  } catch (error) {
    console.error(
      'Erro ao buscar professores:',
      error
    );

    return res.status(500).json({
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
      !professor.senha ||
      typeof professor.senha !== 'string'
    ) {
      return res.status(400).json({
        error: 'Dados de professor inválidos.',
      });
    }

    // =========================
    // CRIPTOGRAFAR SENHA
    // =========================

    const senhaHash =
      await bcrypt.hash(
        professor.senha,
        10
      );

    const novoProfessor =
      await addProfessor({
        ...professor,

        nome:
          professor.nome.trim(),

        senha:
          senhaHash,
      });

    // =========================
    // NUNCA DEVOLVER HASH
    // =========================

    return res.status(201).json(
      professorSeguro(
        novoProfessor
      )
    );

  } catch (error) {
    console.error(
      'Erro ao criar professor:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao criar professor.',
    });
  }
}

/* =========================
   ATUALIZAR PROFESSOR
========================= */

export async function updateProfessor(req, res) {
  try {
    const { id } =
      req.params;

    const professor =
      req.body;

    // =========================
    // VALIDAR ID
    // =========================

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error:
          'ID de professor inválido.',
      });
    }

    // =========================
    // VALIDAR DADOS
    // =========================

    if (
      !professor ||
      typeof professor !== 'object'
    ) {
      return res.status(400).json({
        error:
          'Dados de professor inválidos.',
      });
    }

    const dadosAtualizados = {
      ...professor,
    };

    // =========================
    // SENHA
    // =========================
    //
    // Só cria um novo hash quando
    // uma nova senha foi enviada.
    //

    if (
      professor.senha &&
      typeof professor.senha === 'string'
    ) {
      dadosAtualizados.senha =
        await bcrypt.hash(
          professor.senha,
          10
        );
    } else {
      // Nunca enviar senha vazia
      // para o storage.
      delete dadosAtualizados.senha;
    }

    // =========================
    // ATUALIZAR
    // =========================

    const atualizado =
      await updateProfessorRecord(
        id,
        dadosAtualizados
      );

    if (!atualizado) {
      return res.status(404).json({
        error:
          'Professor não encontrado.',
      });
    }

    // =========================
    // NUNCA DEVOLVER HASH
    // =========================

    return res.json(
      professorSeguro(
        atualizado
      )
    );

  } catch (error) {
    console.error(
      'Erro ao atualizar professor:',
      error
    );

    return res.status(500).json({
      error:
        'Erro ao atualizar professor.',
    });
  }
}