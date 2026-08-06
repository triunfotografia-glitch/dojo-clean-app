import { addAluno, getAlunos } from '../services/storageService.js';

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
