import bcrypt from 'bcrypt';
import {
  addAluno,
  deleteAluno as deleteAlunoRecord,
  getAlunos,
  updateAluno as updateAlunoRecord,
} from '../services/storageService.js';

export async function listAlunos(req, res) {
  try {
    const alunos = await getAlunos();
    res.json(alunos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar alunos.' });
  }
}

export async function createAluno(req, res) {
  try {
    const aluno = req.body;

    if (
      !aluno ||
      typeof aluno !== 'object' ||
      !aluno.nome ||
      typeof aluno.nome !== 'string' ||
      !aluno.nome.trim() ||
      !aluno.email ||
      !aluno.senha
    ) {
      return res.status(400).json({ error: 'Dados de aluno inválidos.' });
    }

    // HASH DA SENHA
    const senhaHash = await bcrypt.hash(aluno.senha, 10);

    const novoAluno = await addAluno({
      ...aluno,
      nome: aluno.nome.trim(),
      senha: senhaHash,
    });

    res.status(201).json(novoAluno);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar aluno.' });
  }
}

export async function updateAluno(req, res) {
  try {
    const { id } = req.params;
    const aluno = req.body;

    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({ error: 'ID de aluno inválido.' });
    }

    if (!aluno || typeof aluno !== 'object') {
      return res.status(400).json({ error: 'Dados de aluno inválidos.' });
    }

    const dadosAtualizados = { ...aluno };

    // Se vier uma nova senha, faz hash antes de atualizar
    if (aluno.senha) {
      dadosAtualizados.senha = await bcrypt.hash(aluno.senha, 10);
    }

    const atualizado = await updateAlunoRecord(id, dadosAtualizados);

    if (!atualizado) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    res.json(atualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar aluno.' });
  }
}

export async function deleteAluno(req, res) {
  try {
    const { id } = req.params;

    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({ error: 'ID de aluno inválido.' });
    }

    const excluido = await deleteAlunoRecord(id);

    if (!excluido) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar aluno.' });
  }
}