import {
  addGraduacao,
  deleteGraduacao as deleteGraduacaoRecord,
  getAluno,
  getGraduacao,
  getGraduacoes,
  updateGraduacao as updateGraduacaoRecord,
} from '../services/storageService.js';


/* =========================================================
   LISTAR GRADUAÇÕES
========================================================= */
export async function listGraduacoes(req, res) {
  try {
    const professorId =
      req.usuario.administrador === true
        ? null
        : Number(req.usuario.id);

    const graduacoes =
      await getGraduacoes(professorId);

    return res.json(graduacoes);
  } catch (error) {
    console.error(
      'Erro ao buscar graduações:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao buscar graduações.',
    });
  }
}


/* =========================================================
   CRIAR GRADUAÇÃO
========================================================= */
export async function createGraduacao(req, res) {
  try {
    const graduacao = req.body;

    if (
      !graduacao ||
      typeof graduacao !== 'object' ||
      Array.isArray(graduacao)
    ) {
      return res.status(400).json({
        error: 'Dados de graduação inválidos.',
      });
    }

    const alunoId =
      graduacao.aluno_id ??
      graduacao.alunoId ??
      graduacao.aluno;

    const faixa =
      graduacao.faixa;

    const data =
      graduacao.data;

    const professor =
      graduacao.professor;

    const observacao =
      graduacao.observacao;


    /* =====================================================
       VALIDAÇÃO
    ===================================================== */

    if (
      alunoId === undefined ||
      alunoId === null ||
      alunoId === '' ||
      !faixa ||
      typeof faixa !== 'string' ||
      !faixa.trim() ||
      !data ||
      typeof data !== 'string' ||
      !data.trim()
    ) {
      return res.status(400).json({
        error: 'Dados de graduação inválidos.',
      });
    }


    if (
      !/^[0-9]+$/.test(
        String(alunoId)
      )
    ) {
      return res.status(400).json({
        error: 'Aluno inválido.',
      });
    }


    /* =====================================================
       VERIFICAR PROPRIEDADE DO ALUNO
    ===================================================== */

    const aluno = await getAluno(Number(alunoId));

    if (!aluno) {
      return res.status(404).json({
        error: 'Aluno não encontrado.',
      });
    }

    if (
      req.usuario.administrador !== true &&
      Number(aluno.professor_id) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'Não autorizado a criar graduação para este aluno.',
      });
    }


    /* =====================================================
       CRIAR GRADUAÇÃO
    ===================================================== */

    const novaGraduacao =
      await addGraduacao({
        aluno_id: Number(alunoId),
        faixa: faixa.trim(),
        data: data.trim(),

        professor:
          typeof professor === 'string'
            ? professor.trim()
            : null,

        observacao:
          typeof observacao === 'string'
            ? observacao.trim()
            : null,
      });


    return res.status(201).json(
      novaGraduacao
    );
  } catch (error) {
    console.error(
      'Erro ao criar graduação:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao criar graduação.',
    });
  }
}


/* =========================================================
   ATUALIZAR GRADUAÇÃO
========================================================= */
export async function updateGraduacao(req, res) {
  try {
    const { id } = req.params;
    const graduacao = req.body;


    /* =====================================================
       VALIDAR ID
    ===================================================== */

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de graduação inválido.',
      });
    }


    /* =====================================================
       VALIDAR BODY
    ===================================================== */

    if (
      !graduacao ||
      typeof graduacao !== 'object' ||
      Array.isArray(graduacao)
    ) {
      return res.status(400).json({
        error: 'Dados de graduação inválidos.',
      });
    }


    /* =====================================================
       VERIFICAR PROPRIEDADE DA GRADUAÇÃO
    ===================================================== */

    const graduacaoAtual = await getGraduacao(Number(id));

    if (!graduacaoAtual) {
      return res.status(404).json({
        error: 'Graduação não encontrada.',
      });
    }

    const alunoAtual = await getAluno(graduacaoAtual.aluno_id);

    if (!alunoAtual) {
      return res.status(404).json({
        error: 'Aluno associado à graduação não encontrado.',
      });
    }

    if (
      req.usuario.administrador !== true &&
      Number(alunoAtual.professor_id) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'Acesso negado a esta graduação.',
      });
    }


    const dadosAtualizados = {};


    /* =====================================================
       ALUNO — BLOQUEADO (não confiar no frontend)
    ===================================================== */

    /* =====================================================
       FAIXA
    ===================================================== */

    if (
      graduacao.faixa !== undefined
    ) {
      if (
        typeof graduacao.faixa !== 'string' ||
        !graduacao.faixa.trim()
      ) {
        return res.status(400).json({
          error: 'Faixa inválida.',
        });
      }

      dadosAtualizados.faixa =
        graduacao.faixa.trim();
    }


    /* =====================================================
       DATA
    ===================================================== */

    if (
      graduacao.data !== undefined
    ) {
      if (
        typeof graduacao.data !== 'string' ||
        !graduacao.data.trim()
      ) {
        return res.status(400).json({
          error: 'Data inválida.',
        });
      }

      dadosAtualizados.data =
        graduacao.data.trim();
    }


    /* =====================================================
       PROFESSOR
    ===================================================== */

    if (
      graduacao.professor !== undefined
    ) {
      dadosAtualizados.professor =
        typeof graduacao.professor === 'string'
          ? graduacao.professor.trim()
          : null;
    }


    /* =====================================================
       OBSERVAÇÃO
    ===================================================== */

    if (
      graduacao.observacao !== undefined
    ) {
      dadosAtualizados.observacao =
        typeof graduacao.observacao === 'string'
          ? graduacao.observacao.trim()
          : null;
    }


    if (
      !Object.keys(dadosAtualizados).length
    ) {
      if (
        graduacao.aluno_id !== undefined ||
        graduacao.alunoId !== undefined ||
        graduacao.aluno !== undefined
      ) {
        return res.json(graduacaoAtual);
      }

      return res.status(400).json({
        error: 'Nenhum campo válido para atualizar.',
      });
    }


    /* =====================================================
       ATUALIZAR
    ===================================================== */

    const atualizada =
      await updateGraduacaoRecord(
        id,
        dadosAtualizados
      );


    if (!atualizada) {
      return res.status(404).json({
        error: 'Graduação não encontrada.',
      });
    }


    return res.json(atualizada);
  } catch (error) {
    console.error(
      'Erro ao atualizar graduação:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao atualizar graduação.',
    });
  }
}


/* =========================================================
   DELETAR GRADUAÇÃO
========================================================= */
export async function deleteGraduacao(req, res) {
  try {
    const { id } = req.params;


    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de graduação inválido.',
      });
    }


    /* =====================================================
       VERIFICAR PROPRIEDADE DA GRADUAÇÃO
    ===================================================== */

    const graduacaoAtual = await getGraduacao(Number(id));

    if (!graduacaoAtual) {
      return res.status(404).json({
        error: 'Graduação não encontrada.',
      });
    }

    const alunoAtual = await getAluno(graduacaoAtual.aluno_id);

    if (!alunoAtual) {
      return res.status(404).json({
        error: 'Aluno associado à graduação não encontrado.',
      });
    }

    if (
      req.usuario.administrador !== true &&
      Number(alunoAtual.professor_id) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'Acesso negado a esta graduação.',
      });
    }


    const excluida =
      await deleteGraduacaoRecord(id);


    if (!excluida) {
      return res.status(404).json({
        error: 'Graduação não encontrada.',
      });
    }


    return res.status(204).send();
  } catch (error) {
    console.error(
      'Erro ao deletar graduação:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao deletar graduação.',
    });
  }
}
