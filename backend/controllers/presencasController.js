import {
  addPresenca,
  getPresencas,
} from '../services/storageService.js';

import { query } from '../services/databaseService.js';

/* =========================================================
   LISTAR PRESENÇAS
========================================================= */

export async function listPresencas(req, res) {
  try {
    const presencas = await getPresencas();

    return res.json(presencas);
  } catch (error) {
    console.error(
      'Erro ao buscar presenças:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao buscar presenças.',
    });
  }
}


/* =========================================================
   CRIAR PRESENÇA
========================================================= */

export async function createPresenca(req, res) {
  try {
    const presenca = req.body;

    if (
      !presenca ||
      typeof presenca !== 'object' ||
      Array.isArray(presenca)
    ) {
      return res.status(400).json({
        error: 'Dados de presença inválidos.',
      });
    }

    const alunoId =
      presenca.aluno_id ??
      presenca.alunoId ??
      presenca.aluno;

    const treinoId =
      presenca.treino_id ??
      presenca.treinoId ??
      presenca.treino;

    const data = presenca.data;
    const status = presenca.status;

    /* =====================================================
       VALIDAR IDS
    ===================================================== */

    const alunoIdNumero = Number(alunoId);
    const treinoIdNumero = Number(treinoId);

    if (
      !Number.isInteger(alunoIdNumero) ||
      alunoIdNumero <= 0
    ) {
      return res.status(400).json({
        error: 'ID do aluno inválido.',
      });
    }

    if (
      !Number.isInteger(treinoIdNumero) ||
      treinoIdNumero <= 0
    ) {
      return res.status(400).json({
        error: 'ID do treino inválido.',
      });
    }

    /* =====================================================
       VALIDAR DATA
    ===================================================== */

    if (
      typeof data !== 'string' ||
      !data.trim()
    ) {
      return res.status(400).json({
        error: 'Data da presença é obrigatória.',
      });
    }

    /* =====================================================
       VALIDAR STATUS
    ===================================================== */

    const statusPermitido = [
      'presente',
      'falta',
      'justificado',
    ];

    if (
      typeof status !== 'string' ||
      !statusPermitido.includes(status.trim())
    ) {
      return res.status(400).json({
        error: 'Status de presença inválido.',
        permitidos: statusPermitido,
      });
    }

    /* =====================================================
       VALIDAR ALUNO ↔ TURMA ↔ TREINO
    ===================================================== */

    const treinoResult = await query(
      `SELECT turma_id FROM treinos WHERE id = $1`,
      [treinoIdNumero]
    );

    if (treinoResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Treino informado não existe.',
      });
    }

    const turmaIdDoTreino = treinoResult.rows[0].turma_id;

    if (turmaIdDoTreino) {
      const turmaAlunoResult = await query(
        `SELECT 1 FROM turma_alunos WHERE turma_id = $1 AND aluno_id = $2`,
        [turmaIdDoTreino, alunoIdNumero]
      );

      if (turmaAlunoResult.rows.length === 0) {
        console.warn('[PRESENCAS] Validação aluno-turma falhou:', {
          aluno_id: alunoIdNumero,
          treino_id: treinoIdNumero,
          turma_id: turmaIdDoTreino,
        });

        return res.status(400).json({
          error:
            'Aluno não pertence à turma associada a este treino.',
        });
      }
    }

    /* =====================================================
       CRIAR PRESENÇA
    ===================================================== */

    const novaPresenca = await addPresenca({
      aluno_id: alunoIdNumero,
      treino_id: treinoIdNumero,
      data: data.trim(),
      status: status.trim(),
    });

    return res.status(201).json(
      novaPresenca
    );

  } catch (error) {
    console.error(
      'Erro ao criar presença:',
      error
    );

    /* =====================================================
       VIOLAÇÃO DE PRESENÇA DUPLICADA
    ===================================================== */

    if (error?.code === '23505') {
      return res.status(409).json({
        error:
          'Já existe uma presença registrada para este aluno, treino e data.',
      });
    }

    /* =====================================================
       FOREIGN KEY
    ===================================================== */

    if (error?.code === '23503') {
      return res.status(400).json({
        error:
          'Aluno ou treino informado não existe.',
      });
    }

    return res.status(500).json({
      error: 'Erro ao criar presença.',
    });
  }
}