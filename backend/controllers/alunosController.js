
import {
  addAluno,
  deleteAluno as deleteAlunoRecord,
  getAluno as getAlunoRecord,
  getAlunos,
  updateAluno as updateAlunoRecord,
} from '../services/storageService.js';


/* =========================================================
   LISTAR ALUNOS
========================================================= */

export async function listAlunos(req, res) {
  try {
    const professorId = Number(req.usuario.id);
    const alunos =
      req.usuario.administrador === true
        ? await getAlunos()
        : await getAlunos(professorId);

    return res.json(alunos);
  } catch (error) {
    console.error(
      'Erro ao buscar alunos:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao buscar alunos.',
    });
  }
}


/* =========================================================
   BUSCAR ALUNO POR ID
========================================================= */

export async function getAluno(req, res) {
  try {
    const { id } = req.params;

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de aluno inválido.',
      });
    }

    const aluno = await getAlunoRecord(id);

    if (!aluno) {
      return res.status(404).json({
        error: 'Aluno não encontrado.',
      });
    }

    if (req.usuario.administrador !== true) {
      const professorId = Number(req.usuario.id);
      const isProprietario = Number(aluno.professor_id) === professorId;

      if (!isProprietario) {
        return res.status(403).json({
          error: 'Acesso negado a este aluno.',
        });
      }
    }

    return res.json(aluno);
  } catch (error) {
    console.error(
      'Erro ao buscar aluno por ID:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao buscar aluno.',
    });
  }
}


/* =========================================================
   CRIAR ALUNO
========================================================= */

export async function createAluno(req, res) {
  try {
    const aluno = req.body;

    if (
      !aluno ||
      typeof aluno !== 'object' ||
      Array.isArray(aluno) ||
      !aluno.nome ||
      typeof aluno.nome !== 'string' ||
      !aluno.nome.trim() ||
      !aluno.email ||
      typeof aluno.email !== 'string' ||
      !aluno.email.trim()
    ) {
      return res.status(400).json({
        error: 'Dados de aluno inválidos.',
      });
    }

    /*
     * ALUNOS NÃO POSSUEM SENHA.
     *
     * Caso alguma versão antiga do frontend envie
     * senha/password, esses campos são simplesmente
     * descartados antes de chegar ao storageService.
     */
    const {
      senha,
      password,
      ...dadosAluno
    } = aluno;

    if (req.usuario.administrador !== true) {
      dadosAluno.professor_id = Number(req.usuario.id);
    }

    const novoAluno = await addAluno({
      ...dadosAluno,
      nome: aluno.nome.trim(),
      email: aluno.email.trim(),
    });

    return res.status(201).json(novoAluno);
  } catch (error) {
    console.error(
      'Erro ao criar aluno:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao criar aluno.',
    });
  }
}

/* =========================================================
ATUALIZAR ALUNO
========================================================= */

export async function updateAluno(req, res) {
  try {
    const { id } = req.params;
    const aluno = req.body;

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de aluno inválido.',
      });
    }

    if (
      !aluno ||
      typeof aluno !== 'object' ||
      Array.isArray(aluno)
    ) {
      return res.status(400).json({
        error: 'Dados de aluno inválidos.',
      });
    }

    /*
     * ALUNOS NÃO POSSUEM SENHA.
     *
     * Remove qualquer campo antigo de senha
     * antes de enviar os dados para o banco.
     */
    const {
      senha,
      password,
      ...dadosAtualizados
    } = aluno;

    if (req.usuario.administrador !== true) {
      delete dadosAtualizados.professor_id;
      delete dadosAtualizados.professorId;
    }

    const atualizado =
      await updateAlunoRecord(
        id,
        dadosAtualizados
      );

    if (!atualizado) {
      return res.status(404).json({
        error: 'Aluno não encontrado.',
      });
    }

    return res.json(atualizado);
  } catch (error) {
    console.error(
      'Erro ao atualizar aluno:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao atualizar aluno.',
    });
  }
}

/* =========================================================
DELETAR ALUNO
========================================================= */

export async function deleteAluno(req, res) {
  try {
    const { id } = req.params;

    if (
      !id ||
      !/^[0-9]+$/.test(id)
    ) {
      return res.status(400).json({
        error: 'ID de aluno inválido.',
      });
    }

    const aluno =
      await getAlunoRecord(id);

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
        error: 'Acesso negado a este aluno.',
      });
    }

    const excluido =
      await deleteAlunoRecord(id);

    if (!excluido) {
      return res.status(404).json({
        error: 'Aluno não encontrado.',
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(
      'Erro ao deletar aluno:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao deletar aluno.',
    });
  }
}