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
    const alunoId = graduacao?.aluno_id || graduacao?.alunoId || graduacao?.aluno;
    const faixa = graduacao?.faixa;
    const data = graduacao?.data;
    const professor = graduacao?.professor;
    const observacao = graduacao?.observacao;

    if (
      !graduacao ||
      typeof graduacao !== 'object' ||
      !alunoId ||
      !faixa ||
      !data ||
      typeof alunoId !== 'string' ||
      typeof faixa !== 'string' ||
      typeof data !== 'string'
    ) {
      return res.status(400).json({ error: 'Dados de graduação inválidos.' });
    }

    const novaGraduacao = await addGraduacao({
      aluno_id: alunoId.trim(),
      faixa: faixa.trim(),
      data: data.trim(),
      professor: typeof professor === 'string' ? professor.trim() : '',
      observacao: typeof observacao === 'string' ? observacao.trim() : '',
    });
    res.status(201).json(novaGraduacao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar graduação.' });
  }
}
