import {
  addPresenca,
  getPresencas,
} from '../services/storageService.js';

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
      detalhe: error?.message || null,
      codigo: error?.code || null,
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
      detalhe: error?.message || null,
      codigo: error?.code || null,
    });
  }
}