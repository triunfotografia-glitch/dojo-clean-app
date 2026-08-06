import { addAluno, getAlunos } from '../services/storageService.js';

export function listAlunos(req, res) {
  const alunos = getAlunos();
  res.json(alunos);
}

export function createAluno(req, res) {
  const aluno = req.body;

  if (!aluno || typeof aluno !== 'object' || !aluno.nome) {
    return res.status(400).json({ error: 'Dados de aluno inválidos.' });
  }

  const novoAluno = addAluno(aluno);
  res.status(201).json(novoAluno);
}
