import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../services/databaseService.js';
import {
  criarRecuperacaoSenha,
  buscarRecuperacaoSenhaValida,
  marcarRecuperacaoSenhaComoUsada,
  invalidarRecuperacoesSenhaProfessor,
  invalidarOtpsProfessor,
  criarOtp,
  buscarOtpValido,
  marcarOtpComoUsado,
} from '../services/storageService.js';
import { sendPasswordResetEmail, isEmailConfigured } from '../services/emailService.js';
import { sendOtpWhatsApp, isWhatsAppConfigured } from '../services/whatsappService.js';

export async function login(req, res) {
  try {
    const { nome, senha } = req.body;

    // =========================
    // VALIDAÇÃO
    // =========================

    if (
      !nome ||
      typeof nome !== 'string' ||
      !nome.trim() ||
      !senha ||
      typeof senha !== 'string'
    ) {
      return res.status(400).json({
        error: 'Nome e senha são obrigatórios.',
      });
    }

    // =========================
    // JWT SECRET
    // =========================

    if (!process.env.JWT_SECRET) {
      console.error(
        'JWT_SECRET não configurado no ambiente.'
      );

      return res.status(500).json({
        error: 'Configuração de autenticação ausente.',
      });
    }

    // =========================
    // BUSCAR PROFESSOR
    // =========================

    const result = await query(
      `
        SELECT
          id,
          nome,
          email,
          senha,
          telefone,
          faixa,
          graus,
          especialidade,
          ativo,
          administrador,
          aluno_id,
          criado_em,
          atualizado_em
        FROM professores
        WHERE LOWER(nome) = LOWER($1)
        LIMIT 1
      `,
      [nome.trim()]
    );

    if (result.rows.length === 0) {
      console.warn('[SECURITY] Falha de login:', {
        nome: req.body.nome,
        ip: req.ip,
      });

      return res.status(401).json({
        error: 'Nome ou senha inválidos.',
      });
    }

    const professor = result.rows[0];

    if (professor.ativo === false) {
      console.warn('[SECURITY] Login bloqueado — professor inativo:', {
        nome: req.body.nome,
        ip: req.ip,
      });

      return res.status(403).json({
        error: 'Professor inativo.',
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      professor.senha
    );

    if (!senhaValida) {
      console.warn('[SECURITY] Falha de login:', {
        nome: req.body.nome,
        ip: req.ip,
      });

      return res.status(401).json({
        error: 'Nome ou senha inválidos.',
      });
    }

    // =========================
    // NÃO ENVIAR HASH AO APP
    // =========================

    const {
      senha: _senha,
      ...professorSeguro
    } = professor;

    // =========================
    // GERAR JWT
    // =========================

    const token = jwt.sign(
      {
        id: String(professor.id),
        nome: professor.nome,
        tipo: 'professor',
        administrador: professor.administrador === true,
      },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '8h',
      }
    );

    // =========================
    // LOGIN OK
    // =========================

    return res.json({
      sucesso: true,
      token,
      professor: professorSeguro,
    });

  } catch (error) {
    console.error(
      'Erro no login:',
      error
    );

    return res.status(500).json({
      error: 'Erro interno ao realizar login.',
    });
  }
}

/* =========================
   ESQUECI A SENHA
========================= */

export async function esqueciSenha(req, res) {
  try {
    const { email, nome } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(200).json({
        mensagem: 'Se os dados estiverem cadastrados, enviaremos um link para recuperação da senha.',
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const result = await query(
      `
        SELECT id, nome, email
        FROM professores
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [emailNormalizado]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        mensagem: 'Se os dados estiverem cadastrados, enviaremos um link para recuperação da senha.',
      });
    }

    const professor = result.rows[0];

    if (nome && typeof nome === 'string' && nome.trim()) {
      const nomeNormalizado = nome.trim().toLowerCase();
      if (!professor.nome.toLowerCase().includes(nomeNormalizado)) {
        return res.status(200).json({
          mensagem: 'Se os dados estiverem cadastrados, enviaremos um link para recuperação da senha.',
        });
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await invalidarRecuperacoesSenhaProfessor(professor.id);
    await criarRecuperacaoSenha(professor.id, tokenHash);

    if (!isEmailConfigured()) {
      console.error('E-mail não configurado para recuperação de senha.');
      return res.status(200).json({
        mensagem: 'Se os dados estiverem cadastrados, enviaremos um link para recuperação da senha.',
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    await sendPasswordResetEmail({
      to: professor.email,
      nome: professor.nome,
      token,
      frontendUrl,
    });

    return res.status(200).json({
      mensagem: 'Se os dados estiverem cadastrados, enviaremos um link para recuperação da senha.',
    });

  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);

    return res.status(200).json({
      mensagem: 'Se os dados estiverem cadastrados, enviaremos um link para recuperação da senha.',
    });
  }
}

/* =========================
   REDEFINIR SENHA
========================= */

export async function redefinirSenha(req, res) {
  try {
    const { token, resetToken, nova_senha } = req.body;

    if (!nova_senha || typeof nova_senha !== 'string' || nova_senha.length < 6) {
      return res.status(400).json({
        error: 'A nova senha deve ter pelo menos 6 caracteres.',
      });
    }

    let professorId = null;

    if (resetToken && typeof resetToken === 'string' && resetToken.trim()) {
      let decoded;
      try {
        decoded = jwt.verify(resetToken.trim(), process.env.JWT_SECRET);
      } catch {
        return res.status(400).json({
          error: 'Token de redefinição inválido ou expirado.',
        });
      }

      if (!decoded || !decoded.professorId || !decoded.resetPassword) {
        return res.status(400).json({
          error: 'Token de redefinição inválido.',
        });
      }

      professorId = decoded.professorId;
    } else if (token && typeof token === 'string' && token.trim()) {
      const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
      const recuperacao = await buscarRecuperacaoSenhaValida(tokenHash);

      if (!recuperacao) {
        return res.status(400).json({
          error: 'Token inválido, expirado ou já utilizado.',
        });
      }

      professorId = recuperacao.professor_id;
      await marcarRecuperacaoSenhaComoUsada(recuperacao.id);
    } else {
      return res.status(400).json({
        error: 'Token de recuperação inválido.',
      });
    }

    const senhaHash = await bcrypt.hash(nova_senha, 10);

    await query(
      `UPDATE professores
       SET senha = $1, atualizado_em = NOW()
       WHERE id = $2`,
      [senhaHash, professorId]
    );

    return res.status(200).json({
      mensagem: 'Senha redefinida com sucesso.',
    });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);

    return res.status(500).json({
      error: 'Erro interno ao redefinir senha.',
    });
  }
}

function normalizarTelefone(telefone) {
  const digits = telefone.replace(/\D/g, '');

  if (!digits || digits.length < 10 || digits.length > 13) {
    return null;
  }

  if (digits.startsWith('55') && digits.length >= 12) {
    return '+' + digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return '+55' + digits;
  }

  return null;
}

/* =========================
   WHATSAPP — SOLICITAR OTP
   ========================= */

export async function solicitarRecuperacaoWhatsApp(req, res) {
  try {
    const { telefone } = req.body;

    if (
      !telefone ||
      typeof telefone !== 'string' ||
      !telefone.trim()
    ) {
      return res.status(200).json({
        mensagem: 'Se os dados estiverem cadastrados, enviaremos um código para recuperação da senha.',
      });
    }

    const telefoneNormalizado = normalizarTelefone(telefone);

    if (!telefoneNormalizado) {
      return res.status(200).json({
        mensagem: 'Se os dados estiverem cadastrados, enviaremos um código para recuperação da senha.',
      });
    }

    const result = await query(
      `SELECT id, telefone
       FROM professores
       WHERE regexp_replace(telefone, '\D', '', 'g') = regexp_replace($1, '\D', '', 'g')
       LIMIT 1`,
      [telefoneNormalizado]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        mensagem: 'Se os dados estiverem cadastrados, enviaremos um código para recuperação da senha.',
      });
    }

    const professor = result.rows[0];

    const codigo = String(crypto.randomInt(100000, 999999));
    const codigoHash = crypto.createHash('sha256').update(codigo).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await invalidarOtpsProfessor(professor.id);
    await criarOtp(professor.id, professor.telefone, codigoHash, expiresAt);

    if (!isWhatsAppConfigured()) {
      console.error('WhatsApp não configurado para recuperação de senha.');
      return res.status(200).json({
        mensagem: 'Se os dados estiverem cadastrados, enviaremos um código para recuperação da senha.',
      });
    }

    const destinatario = `whatsapp:+${professor.telefone.replace(/\D/g, '')}`;

    await sendOtpWhatsApp({
      to: destinatario,
      codigo,
    });

    return res.status(200).json({
      mensagem: 'Se os dados estiverem cadastrados, enviaremos um código para recuperação da senha.',
    });
  } catch (error) {
    console.error('Erro ao solicitar recuperação por WhatsApp:', error);

    return res.status(200).json({
      mensagem: 'Se os dados estiverem cadastrados, enviaremos um código para recuperação da senha.',
    });
  }
}

/* =========================
   WHATSAPP — VALIDAR OTP
   ========================= */

export async function validarOtp(req, res) {
  try {
    const { telefone, codigo } = req.body;

    if (
      !telefone ||
      typeof telefone !== 'string' ||
      !telefone.trim() ||
      !codigo ||
      typeof codigo !== 'string' ||
      !codigo.trim()
    ) {
      return res.status(200).json({
        success: false,
        message: 'Código de recuperação inválido ou expirado.',
      });
    }

    const telefoneNormalizado = normalizarTelefone(telefone);

    if (!telefoneNormalizado) {
      return res.status(200).json({
        success: false,
        message: 'Código de recuperação inválido ou expirado.',
      });
    }

    const codigoHash = crypto.createHash('sha256').update(codigo.trim()).digest('hex');

    const professorResult = await query(
      `SELECT id FROM professores WHERE regexp_replace(telefone, '\D', '', 'g') = regexp_replace($1, '\D', '', 'g') LIMIT 1`,
      [telefoneNormalizado]
    );

    if (professorResult.rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'Código de recuperação inválido ou expirado.',
      });
    }

    const professorId = professorResult.rows[0].id;
    const otp = await buscarOtpValido(professorId, codigoHash);

    if (!otp) {
      return res.status(200).json({
        success: false,
        message: 'Código de recuperação inválido ou expirado.',
      });
    }

    const resetToken = jwt.sign(
      { professorId, resetPassword: true },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    return res.status(200).json({
      success: true,
      resetToken,
    });
  } catch (error) {
    console.error('Erro ao validar OTP:', error);

    return res.status(200).json({
      success: false,
      message: 'Código de recuperação inválido ou expirado.',
    });
  }
}
