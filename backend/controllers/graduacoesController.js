import { addGraduacao, getGraduacoes } from '../services/storageService.js';

export async function listGraduacoes(req, res) {
  try {
    const graduacoes = await getGraduacoes();
    res.json(graduacoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar graduações.' });
  }
}

export async function createGraduacao(req, res) {
  try {
    const graduacao = req.body;

    if (
      !graduacao ||
      typeof graduacao !== 'object' ||
      !graduacao.alunoId ||
      !graduacao.faixa ||
      typeof graduacao.alunoId !== 'string' ||
      typeof graduacao.faixa !== 'string'
    ) {
      return res.status(400).json({ error: 'Dados de graduação inválidos.' });
    }

    const novaGraduacao = await addGraduacao(graduacao);
    res.status(201).json(novaGraduacao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar graduação.' });
  }
}
