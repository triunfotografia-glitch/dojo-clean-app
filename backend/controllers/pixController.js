import {
  getPixConfig,
  updateFirstPixConfig,
  getPixChaves,
  getPixChave,
  getPixChavesAtivas,
  addPixChave,
  updatePixChave,
  deletePixChave,
} from '../services/storageService.js';

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

export async function listarChavesPix(req, res) {
  try {
    const chaves =
      await getPixChaves();

    return res.json(chaves);
  } catch (error) {
    console.error(
      'Erro ao buscar chaves PIX:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao buscar chaves PIX.',
    });
  }
}

export async function listarChavesPixAtivas(req, res) {
  try {
    const chaves =
      await getPixChavesAtivas();

    return res.json(chaves);
  } catch (error) {
    console.error(
      'Erro ao buscar chaves PIX ativas:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao buscar chaves PIX ativas.',
    });
  }
}

export async function criarChavePix(req, res) {
  try {
    const dados = req.body;

    if (
      !dados ||
      typeof dados !== 'object' ||
      Array.isArray(dados)
    ) {
      return res.status(400).json({
        error: 'Dados de chave PIX inválidos.',
      });
    }

    if (
      !dados.nome_identificacao ||
      typeof dados.nome_identificacao !== 'string' ||
      !dados.nome_identificacao.trim()
    ) {
      return res.status(400).json({
        error: 'Identificação da chave PIX é obrigatória.',
      });
    }

    if (
      !dados.chave_pix ||
      typeof dados.chave_pix !== 'string' ||
      !dados.chave_pix.trim()
    ) {
      return res.status(400).json({
        error: 'Chave PIX é obrigatória.',
      });
    }

    const tiposPermitidos = [
      'cpf',
      'cnpj',
      'telefone',
      'email',
      'aleatoria',
    ];

    if (
      dados.tipo &&
      !tiposPermitidos.includes(
        dados.tipo.trim().toLowerCase()
      )
    ) {
      return res.status(400).json({
        error: 'Tipo de chave PIX inválido.',
        permitidos: tiposPermitidos,
      });
    }

    const chave = await addPixChave({
      nome_identificacao:
        dados.nome_identificacao.trim(),
      chave_pix: dados.chave_pix.trim(),
      tipo: dados.tipo
        ? dados.tipo.trim().toLowerCase()
        : 'aleatoria',
      descricao: dados.descricao?.trim() || null,
      ativo: dados.ativo !== undefined
        ? Boolean(dados.ativo)
        : true,
    });

    console.log('[SECURITY] Chave PIX criada:', {
      usuarioId: req.usuario?.id,
      ip: req.ip,
      chaveId: chave.id,
    });

    return res.status(201).json(chave);
  } catch (error) {
    console.error(
      'Erro ao criar chave PIX:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao criar chave PIX.',
    });
  }
}

export async function editarChavePix(req, res) {
  try {
    const { id } = req.params;
    const dados = req.body;

    if (
      !dados ||
      typeof dados !== 'object' ||
      Array.isArray(dados)
    ) {
      return res.status(400).json({
        error: 'Dados de chave PIX inválidos.',
      });
    }

    const chaveExistente =
      await getPixChave(id);

    if (!chaveExistente) {
      return res.status(404).json({
        error: 'Chave PIX não encontrada.',
      });
    }

    if (
      dados.nome_identificacao !== undefined &&
      (!dados.nome_identificacao ||
       typeof dados.nome_identificacao !== 'string' ||
       !dados.nome_identificacao.trim())
    ) {
      return res.status(400).json({
        error: 'Identificação da chave PIX é obrigatória.',
      });
    }

    if (
      dados.chave_pix !== undefined &&
      (!dados.chave_pix ||
       typeof dados.chave_pix !== 'string' ||
       !dados.chave_pix.trim())
    ) {
      return res.status(400).json({
        error: 'Chave PIX é obrigatória.',
      });
    }

    const tiposPermitidos = [
      'cpf',
      'cnpj',
      'telefone',
      'email',
      'aleatoria',
    ];

    if (
      dados.tipo &&
      !tiposPermitidos.includes(
        dados.tipo.trim().toLowerCase()
      )
    ) {
      return res.status(400).json({
        error: 'Tipo de chave PIX inválido.',
        permitidos: tiposPermitidos,
      });
    }

    const atualizacao = {};

    if (dados.nome_identificacao !== undefined) {
      atualizacao.nome_identificacao =
        dados.nome_identificacao.trim();
    }

    if (dados.chave_pix !== undefined) {
      atualizacao.chave_pix =
        dados.chave_pix.trim();
    }

    if (dados.tipo !== undefined) {
      atualizacao.tipo =
        dados.tipo.trim().toLowerCase();
    }

    if (dados.descricao !== undefined) {
      atualizacao.descricao =
        dados.descricao.trim() || null;
    }

    if (dados.ativo !== undefined) {
      atualizacao.ativo = Boolean(dados.ativo);
    }

    const chave = await updatePixChave(
      id,
      atualizacao
    );

    if (!chave) {
      return res.status(500).json({
        error: 'Erro ao atualizar chave PIX.',
      });
    }

    console.log('[SECURITY] Chave PIX editada:', {
      usuarioId: req.usuario?.id,
      ip: req.ip,
      chaveId: id,
    });

    return res.json(chave);
  } catch (error) {
    console.error(
      'Erro ao editar chave PIX:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao editar chave PIX.',
    });
  }
}

export async function excluirChavePix(req, res) {
  try {
    const { id } = req.params;

    const chaveExistente =
      await getPixChave(id);

    if (!chaveExistente) {
      return res.status(404).json({
        error: 'Chave PIX não encontrada.',
      });
    }

    const excluida = await deletePixChave(id);

    if (!excluida) {
      return res.status(500).json({
        error: 'Erro ao excluir chave PIX.',
      });
    }

    console.log('[SECURITY] Chave PIX excluída:', {
      usuarioId: req.usuario?.id,
      ip: req.ip,
      chaveId: id,
    });

    return res.status(204).send();
  } catch (error) {
    console.error(
      'Erro ao excluir chave PIX:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao excluir chave PIX.',
    });
  }
}
