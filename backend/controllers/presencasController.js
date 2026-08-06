import { addPresenca, getPresencas } from '../services/storageService.js';

export async function listPresencas(req, res) {
  try {
    const presencas = await getPresencas();
    res.json(presencas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar presenças.' });
  }
}

export async function createPresenca(req, res) {
  try {
    const presenca = req.body;

    if (
      !presenca ||
      typeof presenca !== 'object' ||
      !presenca.alunoId ||
      !presenca.treinoId ||
      typeof presenca.alunoId !== 'string' ||
      typeof presenca.treinoId !== 'string'
    ) {
      return res.status(400).json({ error: 'Dados de presença inválidos.' });
    }

    const novaPresenca = await addPresenca(presenca);
    res.status(201).json(novaPresenca);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar presença.' });
  }
}
