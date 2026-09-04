import { query } from '../services/databaseService.js';

export async function adminMiddleware(req, res, next) {
  try {
    if (!req.usuario?.id) {
      return res.status(401).json({
        error: 'Usuário não autenticado.',
      });
    }

    const result = await query(
      `
        SELECT
          id,
          administrador,
          ativo
        FROM professores
        WHERE id = $1
        LIMIT 1
      `,
      [req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Professor não encontrado.',
      });
    }

    const professor = result.rows[0];

    if (professor.ativo === false) {
      console.warn('[SECURITY] Acesso administrativo negado — professor inativo:', {
        usuarioId: req.usuario?.id,
        ip: req.ip,
      });

      return res.status(403).json({
        error: 'Professor inativo.',
      });
    }

    if (professor.administrador !== true) {
      console.warn('[SECURITY] Acesso administrativo negado:', {
        usuarioId: req.usuario?.id,
        ip: req.ip,
      });

      return res.status(403).json({
        error: 'Acesso administrativo necessário.',
      });
    }

    req.usuario.administrador = true;

    next();

  } catch (error) {
    console.error(
      'Erro ao verificar permissão administrativa:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao verificar permissão administrativa.',
    });
  }
}

export function professorMiddleware(req, res, next) {
  if (!req.usuario?.tipo || req.usuario.tipo !== 'professor') {
    return res.status(403).json({
      error: 'Acesso permitido apenas para professores.',
    });
  }

  next();
}

export async function professorScopeMiddleware(req, res, next) {
  try {
    if (!req.usuario?.id) {
      return res.status(401).json({
        error: 'Usuário não autenticado.',
      });
    }

    const { id } = req.params;

    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({
        error: 'ID de professor inválido.',
      });
    }

    const result = await query(
      `
        SELECT id, administrador, ativo
        FROM professores
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Professor não encontrado.',
      });
    }

    const professor = result.rows[0];

    if (req.usuario.administrador === true) {
      return next();
    }

    if (Number(professor.id) !== Number(req.usuario.id)) {
      return res.status(403).json({
        error: 'Acesso negado a este professor.',
      });
    }

    next();
  } catch (error) {
    console.error(
      'Erro ao verificar escopo do professor:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao verificar permissão de acesso.',
    });
  }
}

export async function alunoScopeMiddleware(req, res, next) {
  try {
    if (!req.usuario?.id) {
      return res.status(401).json({
        error: 'Usuário não autenticado.',
      });
    }

    const { id } = req.params;

    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({
        error: 'ID de aluno inválido.',
      });
    }

    const result = await query(
      `
        SELECT
          professor_id,
          ativo
        FROM alunos
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Aluno não encontrado.',
      });
    }

    const aluno = result.rows[0];

    if (req.usuario.administrador === true) {
      return next();
    }

    if (
      aluno.professor_id === null ||
      Number(aluno.professor_id) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'Acesso negado a este aluno.',
      });
    }

    next();
  } catch (error) {
    console.error(
      'Erro ao verificar escopo do aluno:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao verificar permissão de acesso.',
    });
  }
}

export async function presencaScopeMiddleware(req, res, next) {
  try {
    if (!req.usuario?.id) {
      return res.status(401).json({
        error: 'Usuário não autenticado.',
      });
    }

    const { id } = req.params;

    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({
        error: 'ID de presença inválido.',
      });
    }

    const result = await query(
      `
        SELECT
          p.id,
          t.professor_id
        FROM presencas p
        JOIN treinos t ON t.id = p.treino_id
        WHERE p.id = $1
        LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Presença não encontrada.',
      });
    }

    const presenca = result.rows[0];

    if (req.usuario.administrador === true) {
      return next();
    }

    if (!presenca.professor_id || Number(presenca.professor_id) !== Number(req.usuario.id)) {
      return res.status(403).json({
        error: 'Acesso negado a esta presença.',
      });
    }

    next();
  } catch (error) {
    console.error(
      'Erro ao verificar escopo da presença:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao verificar permissão de acesso.',
    });
  }
}

export async function cobrancaScopeMiddleware(req, res, next) {
  try {
    if (!req.usuario?.id) {
      return res.status(401).json({
        error: 'Usuário não autenticado.',
      });
    }

    const { id } = req.params;

    if (!id || !/^[0-9]+$/.test(id)) {
      return res.status(400).json({
        error: 'ID de cobrança inválido.',
      });
    }

    const { getCobrancaComProfessor } = await import('../services/storageService.js');
    const cobranca = await getCobrancaComProfessor(Number(id));

    if (!cobranca) {
      return res.status(404).json({
        error: 'Cobrança não encontrada.',
      });
    }

    if (req.usuario.administrador === true) {
      return next();
    }

    if (
      cobranca.professor_id === null ||
      cobranca.professor_id === undefined ||
      Number(cobranca.professor_id) !== Number(req.usuario.id)
    ) {
      return res.status(403).json({
        error: 'Acesso negado a esta cobrança.',
      });
    }

    next();
  } catch (error) {
    console.error(
      'Erro ao verificar escopo da cobrança:',
      error
    );

    return res.status(500).json({
      error: 'Erro ao verificar permissão de acesso.',
    });
  }
}