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