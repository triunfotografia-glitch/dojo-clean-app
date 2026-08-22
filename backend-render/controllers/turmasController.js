import {
  addTurma,
  deleteTurma as deleteTurmaRecord,
  getTurma as getTurmaRecord,
  getTurmas,
  updateTurma as updateTurmaRecord,
} from '../services/storageService.js';

/* =========================================================
   LISTAR TURMAS
========================================================= */

export async function listTurmas(req, res) {
  try {
    const turmas = await getTurmas();

    return res.json(turmas);
  } catch (error) {
    console.error(
      'Erro ao buscar turmas:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao buscar turmas.',
    });
  }
}

/* =========================================================
   BUSCAR TURMA POR ID
========================================================= */

export async function getTurma(req, res) {
  try {
    const { id } = req.params;

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de turma inválido.',
      });
    }

    const turma = await getTurmaRecord(id);

    if (!turma) {
      return res.status(404).json({
        error: 'Turma não encontrada.',
      });
    }

    return res.json(turma);
  } catch (error) {
    console.error(
      'Erro ao buscar turma por ID:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao buscar turma.',
    });
  }
}

/* =========================================================
   CRIAR TURMA
========================================================= */

export async function createTurma(req, res) {
  try {
    const turma = req.body;

    if (
      !turma ||
      typeof turma !== 'object' ||
      Array.isArray(turma) ||
      !turma.nome ||
      typeof turma.nome !== 'string' ||
      !turma.nome.trim()
    ) {
      return res.status(400).json({
        error: 'Dados de turma inválidos.',
      });
    }

    const novaTurma = await addTurma({
      ...turma,
      nome: turma.nome.trim(),
    });

    return res.status(201).json(novaTurma);
  } catch (error) {
    console.error(
      'Erro ao criar turma:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao criar turma.',
    });
  }
}

/* =========================================================
   ATUALIZAR TURMA
========================================================= */

export async function updateTurma(req, res) {
  try {
    const { id } = req.params;
    const turma = req.body;

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de turma inválido.',
      });
    }

    if (
      !turma ||
      typeof turma !== 'object' ||
      Array.isArray(turma)
    ) {
      return res.status(400).json({
        error: 'Dados de turma inválidos.',
      });
    }

    const dadosAtualizados = {
      ...turma,
    };

    if (
      dadosAtualizados.nome !== undefined
    ) {
      if (
        typeof dadosAtualizados.nome !== 'string' ||
        !dadosAtualizados.nome.trim()
      ) {
        return res.status(400).json({
          error: 'Nome da turma inválido.',
        });
      }

      dadosAtualizados.nome =
        dadosAtualizados.nome.trim();
    }

    const atualizado =
      await updateTurmaRecord(
        id,
        dadosAtualizados
      );

    if (!atualizado) {
      return res.status(404).json({
        error: 'Turma não encontrada.',
      });
    }

    return res.json(atualizado);
  } catch (error) {
    console.error(
      'Erro ao atualizar turma:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao atualizar turma.',
    });
  }
}

/* =========================================================
   DELETAR TURMA
========================================================= */

export async function deleteTurma(req, res) {
  try {
    const { id } = req.params;

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de turma inválido.',
      });
    }

    const excluida =
      await deleteTurmaRecord(id);

    if (!excluida) {
      return res.status(404).json({
        error: 'Turma não encontrada.',
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(
      'Erro ao deletar turma:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao deletar turma.',
    });
  }
}
