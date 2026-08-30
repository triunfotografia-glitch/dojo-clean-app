import bcrypt from 'bcrypt';

import {
  addProfessor,
  deleteProfessor as deleteProfessorRecord,
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

  return {
    ...dadosSeguros,
    temSenha:
      typeof professor.senha === "string" &&
      professor.senha.length >= 60,
  };
}

/* =========================
   LISTAR PROFESSORES
========================= */

export async function listProfessores(req, res) {
  try {
    let professores;

    professores = await getProfessores();

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
    const { id } = req.params;

    const professor = req.body;

    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({
        error: 'ID de professor inválido.',
      });
    }

    if (!professor || typeof professor !== 'object') {
      return res.status(400).json({
        error: 'Dados de professor inválidos.',
      });
    }

    const camposPermitidos = [
      'nome',
      'email',
      'telefone',
      'faixa',
      'graus',
      'especialidade',
    ];

    if (req.usuario.administrador === true) {
      camposPermitidos.push('ativo');
      camposPermitidos.push('administrador');
    }

    const dadosAtualizados = {};

    Object.keys(professor).forEach((key) => {
      if (camposPermitidos.includes(key)) {
        dadosAtualizados[key] = professor[key];
      }
    });

    if (professor.administrador !== undefined && req.usuario.administrador === true) {
      dadosAtualizados.administrador = Boolean(professor.administrador);
    }

    if (professor.ativo !== undefined && req.usuario.administrador === true) {
      dadosAtualizados.ativo = Boolean(professor.ativo);
    }

    if (!Object.keys(dadosAtualizados).length) {
      return res.status(400).json({
        error: 'Nenhum campo válido para atualizar.',
      });
    }

    const atualizado =
      await updateProfessorRecord(
        id,
        dadosAtualizados
      );

    if (!atualizado) {
      return res.status(404).json({
        error: 'Professor não encontrado.',
      });
    }

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
      error: 'Erro ao atualizar professor.',
    });
  }
}


/* =========================
   DELETAR PROFESSOR
========================= */


export async function deleteProfessor(req, res) {
  try {
    const { id } = req.params;

    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({
        error: 'ID de professor inválido.',
      });
    }

    if (req.usuario.administrador === true && Number(id) === Number(req.usuario.id)) {
      return res.status(403).json({
        error: 'Não é permitido excluir a própria conta administrativa.',
      });
    }

    const excluido =
      await deleteProfessorRecord(id);

    if (!excluido) {
      return res.status(404).json({
        error: 'Professor não encontrado.',
      });
    }

    return res.status(204).send();

  } catch (error) {
    console.error(
      'Erro ao deletar professor:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao deletar professor.',
    });
  }
}