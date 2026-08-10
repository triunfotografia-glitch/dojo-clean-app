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
    const alunoId = presenca?.aluno_id || presenca?.alunoId || presenca?.aluno;
    const treinoId = presenca?.treino_id || presenca?.treinoId || presenca?.treino;
    const status = presenca?.status;
    const data = presenca?.data;

    const statusPermitido = ['presente', 'falta', 'justificado'];

    if (
      !presenca ||
      typeof presenca !== 'object' ||
      !alunoId ||
      !treinoId ||
      !data ||
      !status ||
      typeof alunoId !== 'string' ||
      typeof treinoId !== 'string' ||
      typeof data !== 'string' ||
      typeof status !== 'string' ||
      !statusPermitido.includes(status)
    ) {
      return res.status(400).json({ error: 'Dados de presença inválidos.' });
    }

    const novaPresenca = await addPresenca({
      aluno_id: alunoId.trim(),
      treino_id: treinoId.trim(),
      data: data.trim(),
      status: status.trim(),
    });
    res.status(201).json(novaPresenca);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar presença.' });
  }
}
