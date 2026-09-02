import {
  addCobranca,
  getCobrancas,
  updateCobranca as updateCobrancaRecord,
  deleteCobranca as deleteCobrancaRecord,
  getAluno,
  getPixChave,
  getCobrancaComProfessor,
} from '../services/storageService.js';
import { enviarCobrancaWhatsApp } from '../services/whatsappService.js';
const STATUS_COBRANCA_PERMITIDOS = ['pendente', 'pago', 'atrasado'];
function normalizarDataISO(valor) {
  if (!valor || typeof valor !== 'string') {
    return null;
  }
  const apenasData = valor.trim().split('T')[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(apenasData)) {
    return null;
  }
  return apenasData;
}
function normalizarNumeroPositivo(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) {
    return null;
  }
  return numero;
}
export async function listCobrancas(req, res) {
  try {
    const professorId =
      req.usuario.administrador === true ? null : Number(req.usuario.id);
    const cobrancas = await getCobrancas(professorId);
    res.json(cobrancas);
  } catch (error) {
    console.error('Erro ao buscar cobran�as:', error);
    res.status(500).json({ error: 'Erro ao buscar cobran�as.' });
  }
}
export async function createCobranca(req, res) {
  try {
    const cobranca = req.body;
    if (!cobranca || typeof cobranca !== 'object' || !cobranca.descricao) {
      return res.status(400).json({ error: 'Dados de cobran�a inv�lidos.' });
    }
    const aluno_id = Number(cobranca.aluno_id);
    if (!Number.isInteger(aluno_id) || aluno_id <= 0) {
      return res.status(400).json({ error: 'ID do aluno inv�lido.' });
    }
    const aluno = await getAluno(aluno_id);
    if (!aluno) {
      return res.status(400).json({ error: 'Aluno informado n�o existe.' });
    }
    if (
      req.usuario.administrador !== true &&
      Number(aluno.professor_id) !== Number(req.usuario.id)
    ) {
      return res
        .status(403)
        .json({ error: 'N�o autorizado a criar cobran�a para este aluno.' });
    }
    const valor = normalizarNumeroPositivo(cobranca.valor);
    if (valor === null) {
      return res.status(400).json({ error: 'Valor da cobran�a inv�lido.' });
    }
    const vencimento = normalizarDataISO(cobranca.vencimento);
    if (vencimento === null) {
      return res.status(400).json({ error: 'Data de vencimento inv�lida.' });
    }
    if (
      cobranca.status &&
      !STATUS_COBRANCA_PERMITIDOS.includes(String(cobranca.status).trim())
    ) {
      return res
        .status(400)
        .json({
          error: 'Status de cobran�a inv�lido.',
          permitidos: STATUS_COBRANCA_PERMITIDOS,
        });
    }
    const dadosParaSalvar = {
      ...cobranca,
      aluno_id,
      valor,
      vencimento,
      status: cobranca.status ? String(cobranca.status).trim() : 'pendente',
    };
    const novaCobranca = await addCobranca(dadosParaSalvar);
    let whatsappLink = '';
    if (novaCobranca.telefone && novaCobranca.nome && novaCobranca.valor) {
      const vencimentoFormatado = novaCobranca.vencimento || '';
      let chavePixInfo = '';
      if (novaCobranca.pix_chave_id) {
        const chavePix = await getPixChave(novaCobranca.pix_chave_id);
        if (chavePix) {
          chavePixInfo = `\n\nPagamento via PIX:\n${chavePix.nome_identificacao}\nTipo: ${chavePix.tipo}\nChave: ${chavePix.chave_pix}`;
        }
      }
      whatsappLink = enviarCobrancaWhatsApp(
        String(novaCobranca.telefone),
        String(novaCobranca.nome),
        String(novaCobranca.valor),
        vencimentoFormatado,
        chavePixInfo
      );
    }
    res.status(201).json(novaCobranca);
  } catch (error) {
    console.error('Erro ao criar cobran�a:', error);
    if (error.code === '23505') {
      return res
        .status(409)
        .json({
          error:
            'J� existe uma cobran�a para este aluno nesta data de vencimento.',
        });
    }
    res.status(500).json({ error: 'Erro ao criar cobran�a.' });
  }
}
export async function updateCobranca(req, res) {
  try {
    const { id } = req.params;
    const cobranca = req.body;
    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({ error: 'ID de cobran�a inv�lido.' });
    }
    if (!cobranca || typeof cobranca !== 'object') {
      return res.status(400).json({ error: 'Dados de cobrança inválidos.' });
    }

    const cobrancaExistente = await getCobrancaComProfessor(id);

    if (!cobrancaExistente) {
      return res.status(404).json({ error: 'Cobrança não encontrada.' });
    }

    if (
      req.usuario.administrador !== true &&
      Number(cobrancaExistente.professor_id) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'Não autorizado a alterar esta cobrança.',
      });
    }

    const dadosAtualizados = {};
    if (cobranca.descricao !== undefined) {
      dadosAtualizados.descricao = String(cobranca.descricao).trim();
    }
    if (cobranca.valor !== undefined) {
      const valor = normalizarNumeroPositivo(cobranca.valor);
      if (valor === null) {
        return res.status(400).json({ error: 'Valor da cobrança inválido.' });
      }
      dadosAtualizados.valor = valor;
    }
    if (cobranca.vencimento !== undefined) {
      const vencimento = normalizarDataISO(cobranca.vencimento);
      if (vencimento === null) {
        return res.status(400).json({ error: 'Data de vencimento inválida.' });
      }
      dadosAtualizados.vencimento = vencimento;
    }
    if (cobranca.status !== undefined) {
      const status = String(cobranca.status).trim();
      if (!STATUS_COBRANCA_PERMITIDOS.includes(status)) {
        return res
          .status(400)
          .json({
            error: 'Status de cobrança inválido.',
            permitidos: STATUS_COBRANCA_PERMITIDOS,
          });
      }
      dadosAtualizados.status = status;
    }
    if (cobranca.forma_pagamento !== undefined) {
      dadosAtualizados.forma_pagamento = String(cobranca.forma_pagamento).trim();
    }
    if (cobranca.pago_em !== undefined) {
      const pagoEm = normalizarDataISO(cobranca.pago_em);
      if (pagoEm === null) {
        return res.status(400).json({ error: 'Data de pagamento inválida.' });
      }
      dadosAtualizados.pago_em = pagoEm;
    }
    if (!Object.keys(dadosAtualizados).length) {
      return res
        .status(400)
        .json({ error: 'Nenhum campo v�lido para atualizar.' });
    }
    const atualizada = await updateCobrancaRecord(id, dadosAtualizados);
    if (!atualizada) {
      return res.status(404).json({ error: 'Cobran�a n�o encontrada.' });
    }
    res.json(atualizada);
  } catch (error) {
    console.error('Erro ao atualizar cobran�a:', error);
    res.status(500).json({ error: 'Erro ao atualizar cobran�a.' });
  }
}
export async function deleteCobranca(req, res) {
  try {
    const { id } = req.params;
    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({ error: 'ID de cobrança inválido.' });
    }

    const cobrancaExistente = await getCobrancaComProfessor(id);

    if (!cobrancaExistente) {
      return res.status(404).json({ error: 'Cobrança não encontrada.' });
    }

    if (
      req.usuario.administrador !== true &&
      Number(cobrancaExistente.professor_id) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'Não autorizado a excluir esta cobrança.',
      });
    }

    const excluida = await deleteCobrancaRecord(id);
    if (!excluida) {
      return res.status(404).json({ error: 'Cobran�a n�o encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir cobran�a:', error);
    res.status(500).json({ error: 'Erro ao excluir cobran�a.' });
  }
}
