import {
  addTurma,
  deleteTurma as deleteTurmaRecord,
  getAluno,
  getTurma as getTurmaRecord,
  getTurmas,
  updateTurma as updateTurmaRecord,
} from '../services/storageService.js';

function normalizarIdAluno(valor) {
  if (typeof valor === 'number' && Number.isSafeInteger(valor) && valor > 0) {
    return valor;
  }

  if (typeof valor === 'string' && /^\d+$/.test(valor)) {
    const num = Number(valor);

    if (Number.isSafeInteger(num) && num > 0) {
      return num;
    }
  }

  return null;
}

function obterAlunoIds(turma) {
  for (const campo of ['alunos', 'aluno_ids', 'alunoIds']) {
    if (Object.prototype.hasOwnProperty.call(turma, campo)) {
      return {
        informado: true,
        valor: turma[campo],
      };
    }
  }

  return {
    informado: false,
    valor: undefined,
  };
}

function normalizarAlunoIds(turma) {
  const campo = obterAlunoIds(turma);

  if (!campo.informado) {
    return {
      informado: false,
      ids: undefined,
    };
  }

  if (!Array.isArray(campo.valor)) {
    return {
      informado: true,
      ids: null,
    };
  }

  const ids = campo.valor.map(normalizarIdAluno);

  if (ids.some((id) => id === null)) {
    return {
      informado: true,
      ids: null,
    };
  }

  return {
    informado: true,
    ids: [...new Set(ids)],
  };
}

async function validarAlunosDaTurma(req, alunoIds) {
  for (const alunoId of alunoIds) {
    const aluno = await getAluno(alunoId);

    if (!aluno) {
      return { erro: 'Aluno não encontrado.', status: 404 };
    }
  }

  return null;
}

/* =========================================================
   LISTAR TURMAS
========================================================= */
export async function listTurmas(req, res) {
  try {
    const turmas = await getTurmas();

    if (
      req.usuario.administrador !== true
    ) {
      const professorId =
        Number(req.usuario.id);

      const turmasFiltradas =
        turmas.filter(
          (turma) =>
            Number(
              turma.professor_id
            ) === professorId
        );

      return res.json(
        turmasFiltradas
      );
    }

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

    if (
      req.usuario.administrador !== true &&
      Number(turma.professor_id) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'Acesso negado a esta turma.',
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

    const { professor_id, ...dadosTurma } = turma;

    const dadosComProfessor = {
      ...dadosTurma,
      nome: turma.nome.trim(),
      professor_id:
        req.usuario.administrador === true
          ? Number(professor_id) || Number(req.usuario.id)
          : Number(req.usuario.id),
    };

    const alunoIdsNormalizados =
      normalizarAlunoIds(dadosComProfessor);

    if (
      alunoIdsNormalizados.informado &&
      alunoIdsNormalizados.ids === null
    ) {
      return res.status(400).json({
        error: 'IDs de alunos inválidos.',
      });
    }

    const alunoIds =
      alunoIdsNormalizados.ids || [];

    if (alunoIdsNormalizados.informado) {
      dadosComProfessor.aluno_ids = alunoIds;
      delete dadosComProfessor.alunos;
      delete dadosComProfessor.alunoIds;
    }

    if (alunoIds.length > 0) {
      const validacao = await validarAlunosDaTurma(req, alunoIds);
      if (validacao) {
        return res.status(validacao.status).json({ error: validacao.erro });
      }
    }

    const novaTurma = await addTurma(dadosComProfessor);

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

    const turmaAtual = await getTurmaRecord(id);

    if (!turmaAtual) {
      return res.status(404).json({
        error: 'Turma não encontrada.',
      });
    }

    if (
      req.usuario.administrador !== true &&
      Number(turmaAtual.professor_id) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'Acesso negado a esta turma.',
      });
    }

    const { professor_id, ...dadosAtualizados } = turma;

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

    const alunoIdsNormalizados =
      normalizarAlunoIds(dadosAtualizados);

    if (
      alunoIdsNormalizados.informado &&
      alunoIdsNormalizados.ids === null
    ) {
      return res.status(400).json({
        error: 'IDs de alunos inválidos.',
      });
    }

    const temAlteracaoAlunos =
      alunoIdsNormalizados.informado;

    if (temAlteracaoAlunos) {
      dadosAtualizados.aluno_ids =
        alunoIdsNormalizados.ids;
      delete dadosAtualizados.alunos;
      delete dadosAtualizados.alunoIds;
    }

    if (temAlteracaoAlunos) {
      const alunoIds =
        alunoIdsNormalizados.ids || [];

      if (alunoIds.length > 0) {
        const validacao = await validarAlunosDaTurma(req, alunoIds);
        if (validacao) {
          return res.status(validacao.status).json({ error: validacao.erro });
        }
      }
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

    const turmaAtual = await getTurmaRecord(id);

    if (!turmaAtual) {
      return res.status(404).json({
        error: 'Turma não encontrada.',
      });
    }

    if (
      req.usuario.administrador !== true &&
      Number(turmaAtual.professor_id) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'Acesso negado a esta turma.',
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
