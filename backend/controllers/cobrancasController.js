import { addCobranca, getCobrancas } from '../services/storageService.js';
import { enviarCobrancaWhatsApp } from '../services/whatsappService.js';

export function listCobrancas(req, res) {
  const cobrancas = getCobrancas();
  res.json(cobrancas);
}

export function createCobranca(req, res) {
  const cobranca = req.body;

  if (!cobranca || typeof cobranca !== 'object' || !cobranca.descricao) {
    return res.status(400).json({ error: 'Dados de cobrança inválidos.' });
  }

  const novaCobranca = addCobranca(cobranca);
  res.status(201).json({
    ...novaCobranca,
    whatsappLink: enviarCobrancaWhatsApp(
      String(cobranca.telefone || ''),
      String(cobranca.nome || ''),
      String(cobranca.valor || ''),
    ),
  });
}
