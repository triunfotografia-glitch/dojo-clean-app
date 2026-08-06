import { addCobranca, getCobrancas } from '../services/storageService.js';
import { enviarCobrancaWhatsApp } from '../services/whatsappService.js';

export async function listCobrancas(req, res) {
  try {
    const cobrancas = await getCobrancas();
    res.json(cobrancas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar cobranças.' });
  }
}

export async function createCobranca(req, res) {
  try {
    const cobranca = req.body;

    if (!cobranca || typeof cobranca !== 'object' || !cobranca.descricao) {
      return res.status(400).json({ error: 'Dados de cobrança inválidos.' });
    }

    const novaCobranca = await addCobranca(cobranca);
    res.status(201).json({
      ...novaCobranca,
      whatsappLink: enviarCobrancaWhatsApp(
        String(cobranca.telefone || ''),
        String(cobranca.nome || ''),
        String(cobranca.valor || ''),
      ),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar cobrança.' });
  }
}
