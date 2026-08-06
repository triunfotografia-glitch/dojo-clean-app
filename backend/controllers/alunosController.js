import { addAluno, getAlunos, updateAluno as updateAlunoRecord, deleteAluno as deleteAlunoRecord } from '../services/storageService.js';

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

    if (!aluno || typeof aluno !== 'object' || !aluno.nome || typeof aluno.nome !== 'string' || !aluno.nome.trim()) {
      return res.status(400).json({ error: 'Dados de aluno inválidos.' });
    }

    const novoAluno = await addAluno({ ...aluno, nome: aluno.nome.trim() });
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

    const atualizado = await updateAlunoRecord(id, aluno);

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
