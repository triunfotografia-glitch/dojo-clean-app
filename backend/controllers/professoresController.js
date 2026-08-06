import { addProfessor, getProfessores } from '../services/storageService.js';

export async function listProfessores(req, res) {
  try {
    const professores = await getProfessores();
    res.json(professores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar professores.' });
  }
}

export async function createProfessor(req, res) {
  try {
    const professor = req.body;

    if (!professor || typeof professor !== 'object' || !professor.nome || typeof professor.nome !== 'string' || !professor.nome.trim()) {
      return res.status(400).json({ error: 'Dados de professor inválidos.' });
    }

    const novoProfessor = await addProfessor({
      ...professor,
      nome: professor.nome.trim(),
    });

    res.status(201).json(novoProfessor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar professor.' });
  }
}
