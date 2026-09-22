import {
  createChamada as createChamadaRecord,
  getChamadaById,
  getChamadaByTreinoData,
  encerrarChamada as encerrarChamadaRecord,
  getTreino,
} from '../services/storageService.js';

function parseData(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())
  ) {
    return null;
  }

  return value.trim();
}

function podeGerenciarTreino(req, professorId) {
  return (
    req.usuario.administrador === true ||
    Number(professorId) === Number(req.usuario.id)
  );
}

export async function createChamada(req, res) {
  try {
    const treinoId = Number(
      req.body?.treino_id ?? req.body?.treinoId
    );
    const data = parseData(req.body?.data);

    if (
      !Number.isInteger(treinoId) ||
      treinoId <= 0 ||
      !data
    ) {
      return res.status(400).json({
        error: 'Treino e data da chamada são obrigatórios.',
      });
    }

    const treino = await getTreino(treinoId);

    if (!treino) {
      return res.status(404).json({
        error: 'Treino não encontrado.',
      });
    }

    if (!podeGerenciarTreino(req, treino.professor_id)) {
      return res.status(403).json({
        error: 'Acesso negado a este treino.',
      });
    }

    const existente = await getChamadaByTreinoData(
      treinoId,
      data
    );

    if (existente) {
      return res.status(409).json({
        error: 'Já existe uma chamada para este treino e data.',
      });
    }

    const chamada = await createChamadaRecord({
      treino_id: treinoId,
      data,
      professor_id: treino.professor_id,
    });

    return res.status(201).json(chamada);
  } catch (error) {
    if (error?.code === '23505') {
      return res.status(409).json({
        error: 'Já existe uma chamada para este treino e data.',
      });
    }

    console.error('Erro ao criar chamada:', error);

    return res.status(500).json({
      error: 'Erro ao criar chamada.',
    });
  }
}

export async function getChamada(req, res) {
  try {
    const treinoId = Number(req.params.treinoId);
    const data = parseData(req.query.data);

    if (
      !Number.isInteger(treinoId) ||
      treinoId <= 0 ||
      !data
    ) {
      return res.status(400).json({
        error: 'Treino e data da chamada são obrigatórios.',
      });
    }

    const treino = await getTreino(treinoId);

    if (!treino) {
      return res.status(404).json({
        error: 'Treino não encontrado.',
      });
    }

    if (!podeGerenciarTreino(req, treino.professor_id)) {
      return res.status(403).json({
        error: 'Acesso negado a este treino.',
      });
    }

    const chamada = await getChamadaByTreinoData(
      treinoId,
      data
    );

    return res.json(chamada);
  } catch (error) {
    console.error('Erro ao buscar chamada:', error);

    return res.status(500).json({
      error: 'Erro ao buscar chamada.',
    });
  }
}

export async function encerrarChamada(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'ID de chamada inválido.',
      });
    }

    const chamada = await getChamadaById(id);

    if (!chamada) {
      return res.status(404).json({
        error: 'Chamada não encontrada.',
      });
    }

    if (!podeGerenciarTreino(req, chamada.professor_id)) {
      return res.status(403).json({
        error: 'Acesso negado a esta chamada.',
      });
    }

    const resultado = await encerrarChamadaRecord(
      id,
      req.usuario.id
    );

    if (resultado.status === 'not_found') {
      return res.status(404).json({
        error: 'Chamada não encontrada.',
      });
    }

    if (resultado.status === 'closed') {
      return res.status(409).json({
        error: 'A chamada já está encerrada.',
      });
    }

    return res.json(resultado.chamada);
  } catch (error) {
    console.error('Erro ao encerrar chamada:', error);

    return res.status(500).json({
      error: 'Erro ao encerrar chamada.',
    });
  }
}
