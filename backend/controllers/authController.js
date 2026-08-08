import bcrypt from 'bcrypt';
import { query } from '../services/databaseService.js';

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
      return res.status(401).json({
        error: 'Nome ou senha inválidos.',
      });
    }

    const professor = result.rows[0];

    // =========================
    // PROFESSOR INATIVO
    // =========================

    if (professor.ativo === false) {
      return res.status(403).json({
        error: 'Professor inativo.',
      });
    }

    // =========================
    // COMPARAR SENHA
    // =========================

    const senhaValida = await bcrypt.compare(
      senha,
      professor.senha
    );

    if (!senhaValida) {
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
    // LOGIN OK
    // =========================

    res.json({
      sucesso: true,
      professor: professorSeguro,
    });
  } catch (error) {
    console.error('Erro no login:', error);

    res.status(500).json({
      error: 'Erro interno ao realizar login.',
    });
  }
}