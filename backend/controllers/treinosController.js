import { addTreino, getTreinos } from '../services/storageService.js';

export async function listTreinos(req, res) {
  try {
    const treinos = await getTreinos();
    res.json(treinos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar treinos.' });
  }
}

export async function createTreino(req, res) {
  try {
    const treino = req.body;

    if (!treino || typeof treino !== 'object' || !treino.nome || typeof treino.nome !== 'string' || !treino.nome.trim()) {
      return res.status(400).json({ error: 'Dados de treino inválidos.' });
    }

    const novoTreino = await addTreino({
      ...treino,
      nome: treino.nome.trim(),
    });

    res.status(201).json(novoTreino);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar treino.' });
  }
}
