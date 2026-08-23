import { getProximosCampeonatos } from '../services/campeonatoService.js';

export async function listCampeonatos(req, res) {
  try {
    const campeonatos = await getProximosCampeonatos();

    return res.json(campeonatos);
  } catch (error) {
    console.error('Erro ao buscar campeonatos:', error);

    return res.status(500).json({
      error: 'Erro ao buscar campeonatos.',
      detalhe: error?.message || null,
      codigo: error?.code || null,
    });
  }
}
