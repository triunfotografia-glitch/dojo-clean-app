import {
  addTreino,
  deleteTreino as deleteTreinoRecord,
  getTreino as getTreinoRecord,
  getTreinos,
  updateTreino as updateTreinoRecord,
} from '../services/storageService.js';

const MAX_POSTGRES_INTEGER = 2147483647;

function normalizarIdRelacionamento(valor) {
  if (!/^\d+$/.test(String(valor))) {
    return undefined;
  }

  const id = Number(valor);

  return Number.isSafeInteger(id) &&
    id > 0 &&
    id <= MAX_POSTGRES_INTEGER
    ? id
    : undefined;
}

function normalizarRelacionamentos(treino) {
  const dados = { ...treino };

  for (const campo of ['turma_id', 'professor_id']) {
    if (dados[campo] === undefined) {
      continue;
    }

    const id = normalizarIdRelacionamento(dados[campo]);

    if (id === undefined) {
      delete dados[campo];
    } else {
      dados[campo] = id;
    }
  }

  return dados;
}

/* =========================================================
   LISTAR TREINOS
========================================================= */

export async function listTreinos(req, res) {
  try {
    const treinos = await getTreinos();

    return res.json(treinos);
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);

    return res.status(500).json({
      error: 'Erro ao buscar treinos.',
    });
  }
}

/* =========================================================
   BUSCAR TREINO POR ID
========================================================= */

export async function getTreino(req, res) {
  try {
    const { id } = req.params;

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de treino inválido.',
      });
    }

    const treino = await getTreinoRecord(id);

    if (!treino) {
      return res.status(404).json({
        error: 'Treino não encontrado.',
      });
    }

    return res.json(treino);
  } catch (error) {
    console.error(
      'Erro ao buscar treino por ID:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao buscar treino.',
    });
  }
}

/* =========================================================
   CRIAR TREINO
========================================================= */

export async function createTreino(req, res) {
  try {
    const treino = req.body;

    if (
      !treino ||
      typeof treino !== 'object' ||
      Array.isArray(treino) ||
      !treino.nome ||
      typeof treino.nome !== 'string' ||
      !treino.nome.trim()
    ) {
      return res.status(400).json({
        error: 'Dados de treino inválidos.',
      });
    }

    const novoTreino = await addTreino(normalizarRelacionamentos({
      ...treino,
      nome: treino.nome.trim(),
    }));

    return res.status(201).json(novoTreino);
  } catch (error) {
    console.error(
      'Erro ao criar treino:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao criar treino.',
    });
  }
}

/* =========================================================
   ATUALIZAR TREINO
========================================================= */

export async function updateTreino(req, res) {
  try {
    const { id } = req.params;
    const treino = req.body;

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de treino inválido.',
      });
    }

    if (
      !treino ||
      typeof treino !== 'object' ||
      Array.isArray(treino)
    ) {
      return res.status(400).json({
        error: 'Dados de treino inválidos.',
      });
    }

    const dadosAtualizados = normalizarRelacionamentos(treino);

    if (
      dadosAtualizados.nome !== undefined
    ) {
      if (
        typeof dadosAtualizados.nome !== 'string' ||
        !dadosAtualizados.nome.trim()
      ) {
        return res.status(400).json({
          error: 'Nome do treino inválido.',
        });
      }

      dadosAtualizados.nome =
        dadosAtualizados.nome.trim();
    }

    const atualizado =
      await updateTreinoRecord(
        id,
        dadosAtualizados
      );

    if (!atualizado) {
      return res.status(404).json({
        error: 'Treino não encontrado.',
      });
    }

    return res.json(atualizado);
  } catch (error) {
    console.error(
      'Erro ao atualizar treino:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao atualizar treino.',
    });
  }
}

/* =========================================================
   DELETAR TREINO
========================================================= */

export async function deleteTreino(req, res) {
  try {
    const { id } = req.params;

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de treino inválido.',
      });
    }

    const excluido =
      await deleteTreinoRecord(id);

    if (!excluido) {
      return res.status(404).json({
        error: 'Treino não encontrado.',
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(
      'Erro ao deletar treino:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao deletar treino.',
    });
  }
}
