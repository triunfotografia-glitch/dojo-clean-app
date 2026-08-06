import { addTurma, getTurmas } from '../services/storageService.js';

export async function listTurmas(req, res) {
  try {
    const turmas = await getTurmas();
    res.json(turmas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar turmas.' });
  }
}

export async function createTurma(req, res) {
  try {
    const turma = req.body;

    if (!turma || typeof turma !== 'object' || !turma.nome || typeof turma.nome !== 'string' || !turma.nome.trim()) {
      return res.status(400).json({ error: 'Dados de turma inválidos.' });
    }

    const novaTurma = await addTurma({
      ...turma,
      nome: turma.nome.trim(),
    });

    res.status(201).json(novaTurma);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar turma.' });
  }
}
