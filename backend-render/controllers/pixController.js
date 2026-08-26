import {
  getPixConfig,
  updateFirstPixConfig,
} from '../services/storageService.js';

/* =========================================================
   LISTAR PIX CONFIG
========================================================= */

export async function getPix(req, res) {
  try {
    const config =
      await getPixConfig();

    if (!config) {
      return res.status(404).json({
        error:
          'Configuração PIX não encontrada.',
      });
    }

    return res.json(config);
  } catch (error) {
    console.error(
      'Erro ao buscar configuração PIX:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao buscar configuração PIX.',
    });
  }
}

/* =========================================================
   ATUALIZAR PIX CONFIG
========================================================= */

export async function updatePix(req, res) {
  try {
    const dados = req.body;

    if (
      !dados ||
      typeof dados !== 'object' ||
      Array.isArray(dados)
    ) {
      return res.status(400).json({
        error: 'Dados de configuração PIX inválidos.',
      });
    }

    const atualizados = {};

    if (
      dados.chave_pix !== undefined &&
      typeof dados.chave_pix === 'string' &&
      dados.chave_pix.trim()
    ) {
      atualizados.chave_pix =
        dados.chave_pix.trim();
    }

    if (
      dados.nome_recebedor !== undefined &&
      typeof dados.nome_recebedor === 'string'
    ) {
      atualizados.nome_recebedor =
        dados.nome_recebedor.trim() || 'DOJO LB';
    }

    if (
      dados.cidade_recebedor !== undefined &&
      typeof dados.cidade_recebedor === 'string'
    ) {
      atualizados.cidade_recebedor =
        dados.cidade_recebedor.trim() || 'SAO PAULO';
    }

    if (!Object.keys(atualizados).length) {
      return res.status(400).json({
        error:
          'Nenhum campo válido para atualizar.',
      });
    }

    const config =
      await updateFirstPixConfig(
        atualizados
      );

    if (!config) {
      return res.status(500).json({
        error:
          'Erro ao atualizar configuração PIX.',
      });
    }

    console.log('[SECURITY] Configuração PIX alterada:', {
      usuarioId: req.usuario?.id,
      ip: req.ip,
    });

    return res.json(config);
  } catch (error) {
    console.error(
      'Erro ao atualizar configuração PIX:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao atualizar configuração PIX.',
    });
  }
}
