import {
  addPresenca,
  deletePresenca as deletePresencaRecord,
  getPresencas,
  getPresencasPorTreino,
  updatePresenca as updatePresencaRecord,
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


/* =========================================================
   LISTAR PRESENÇAS POR TREINO
========================================================= */

export async function listPresencasPorTreino(req, res) {
  try {
    const { treinoId } =
      req.params;

    const data =
      req.query.data;

    if (
      !treinoId ||
      !/^[0-9]+$/.test(
        String(treinoId)
      )
    ) {
      return res.status(400).json({
        error: 'ID do treino inválido.',
      });
    }

    const treinoIdNumero =
      Number(treinoId);

    const dataStr =
      typeof data === 'string' &&
      data.trim()
        ? data.trim()
        : null;

    if (dataStr) {
      const partes =
        dataStr.split('-');

      if (
        partes.length !== 3 ||
        !/^\d{4}$/.test(partes[0]) ||
        !/^\d{2}$/.test(partes[1]) ||
        !/^\d{2}$/.test(partes[2])
      ) {
        return res.status(400).json({
          error:
            'Data inválida. Use o formato YYYY-MM-DD.',
        });
      }
    }

    const presencas =
      await getPresencasPorTreino(
        treinoIdNumero,
        dataStr
      );

    return res.json(presencas);
  } catch (error) {
    console.error(
      'Erro ao buscar presenças por treino:',
      error
    );

    return res.status(500).json({
      error:
        'Erro ao buscar presenças por treino.',
      detalhe: error?.message || null,
      codigo: error?.code || null,
    });
  }
}


/* =========================================================
   ATUALIZAR PRESENÇA
========================================================= */

export async function updatePresenca(req, res) {
  try {
    const { id } = req.params;

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de presença inválido.',
      });
    }

    const presenca =
      req.body;

    if (
      !presenca ||
      typeof presenca !== 'object' ||
      Array.isArray(presenca)
    ) {
      return res.status(400).json({
        error: 'Dados de presença inválidos.',
      });
    }

    const dadosAtualizados = {};

    /* =====================================================
       STATUS
    ===================================================== */

    if (
      presenca.status !== undefined
    ) {
      const statusPermitido = [
        'presente',
        'falta',
        'justificado',
      ];

      if (
        typeof presenca.status !== 'string' ||
        !statusPermitido.includes(
          presenca.status.trim()
        )
      ) {
        return res.status(400).json({
          error: 'Status de presença inválido.',
          permitidos: statusPermitido,
        });
      }

      dadosAtualizados.status =
        presenca.status.trim();
    }

    /* =====================================================
       DATA
    ===================================================== */

    if (
      presenca.data !== undefined
    ) {
      if (
        typeof presenca.data !== 'string' ||
        !presenca.data.trim()
      ) {
        return res.status(400).json({
          error: 'Data da presença é obrigatória.',
        });
      }

      dadosAtualizados.data =
        presenca.data.trim();
    }

    if (
      !Object.keys(dadosAtualizados).length
    ) {
      return res.status(400).json({
        error:
          'Nenhum campo válido para atualizar.',
      });
    }

    const atualizada =
      await updatePresencaRecord(
        id,
        dadosAtualizados
      );

    if (!atualizada) {
      return res.status(404).json({
        error: 'Presença não encontrada.',
      });
    }

    return res.json(atualizada);
  } catch (error) {
    console.error(
      'Erro ao atualizar presença:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao atualizar presença.',
      detalhe: error?.message || null,
      codigo: error?.code || null,
    });
  }
}


/* =========================================================
   DELETAR PRESENÇA
========================================================= */

export async function deletePresenca(req, res) {
  try {
    const { id } = req.params;

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de presença inválido.',
      });
    }

    const excluida =
      await deletePresencaRecord(id);

    if (!excluida) {
      return res.status(404).json({
        error: 'Presença não encontrada.',
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(
      'Erro ao excluir presença:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao excluir presença.',
      detalhe: error?.message || null,
      codigo: error?.code || null,
    });
  }
}