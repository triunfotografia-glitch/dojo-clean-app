import {
  addCobranca,
  getCobrancas,
  updateCobranca as updateCobrancaRecord,
  deleteCobranca as deleteCobrancaRecord,
  getPixChave,
} from '../services/storageService.js';

import { enviarCobrancaWhatsApp } from '../services/whatsappService.js';

export async function listCobrancas(req, res) {
  try {
    const cobrancas = await getCobrancas();

    res.json(cobrancas);
  } catch (error) {
    console.error('Erro ao buscar cobranças:', error);

    res.status(500).json({
      error: 'Erro ao buscar cobranças.',
    });
  }
}

export async function createCobranca(req, res) {
  try {
    const cobranca = req.body;

    if (
      !cobranca ||
      typeof cobranca !== 'object' ||
      !cobranca.descricao
    ) {
      return res.status(400).json({
        error: 'Dados de cobrança inválidos.',
      });
    }

    const novaCobranca =
      await addCobranca(cobranca);

    let whatsappLink = '';

    if (
      novaCobranca.telefone &&
      novaCobranca.nome &&
      novaCobranca.valor
    ) {
      const vencimento =
        novaCobranca.vencimento ||
        '';

      let chavePixInfo = '';

      if (novaCobranca.pix_chave_id) {
        const chavePix =
          await getPixChave(
            novaCobranca.pix_chave_id
          );

        if (chavePix) {
          chavePixInfo = `\n\nPagamento via PIX:\n${chavePix.nome_identificacao}\nTipo: ${chavePix.tipo}\nChave: ${chavePix.chave_pix}`;
        }
      }

      whatsappLink = enviarCobrancaWhatsApp(
        String(novaCobranca.telefone),
        String(novaCobranca.nome),
        String(novaCobranca.valor),
        vencimento,
        chavePixInfo
      );
    }

    res.status(201).json({
      ...novaCobranca,
      whatsappLink,
    });
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Já existe uma cobrança para este aluno nesta data de vencimento.',
      });
    }

    res.status(500).json({
      error: 'Erro ao criar cobrança.',
    });
  }
}

export async function updateCobranca(req, res) {
  try {
    const { id } = req.params;
    const cobranca = req.body;

    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({
        error: 'ID de cobrança inválido.',
      });
    }

    if (
      !cobranca ||
      typeof cobranca !== 'object'
    ) {
      return res.status(400).json({
        error: 'Dados de cobrança inválidos.',
      });
    }

    const atualizada =
      await updateCobrancaRecord(
        id,
        cobranca
      );

    if (!atualizada) {
      return res.status(404).json({
        error: 'Cobrança não encontrada.',
      });
    }

    res.json(atualizada);
  } catch (error) {
    console.error('Erro ao atualizar cobrança:', error);

    res.status(500).json({
      error: 'Erro ao atualizar cobrança.',
    });
  }
}

export async function deleteCobranca(req, res) {
  try {
    const { id } = req.params;

    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({
        error: 'ID de cobrança inválido.',
      });
    }

    const excluida =
      await deleteCobrancaRecord(id);

    if (!excluida) {
      return res.status(404).json({
        error: 'Cobrança não encontrada.',
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir cobrança:', error);

    res.status(500).json({
      error: 'Erro ao excluir cobrança.',
    });
  }
}
