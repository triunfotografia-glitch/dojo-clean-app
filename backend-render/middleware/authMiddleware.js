import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  try {
    // =========================
    // VERIFICAR JWT SECRET
    // =========================

    if (!process.env.JWT_SECRET) {
      console.error(
        'JWT_SECRET não configurado.'
      );

      return res.status(500).json({
        error: 'Configuração de autenticação ausente.',
      });
    }

    // =========================
    // LER HEADER AUTHORIZATION
    // =========================

    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        error: 'Token de autenticação não informado.',
      });
    }

    // =========================
    // FORMATO:
    // Bearer TOKEN
    // =========================

    const [tipo, token] =
      authorization.split(' ');

    if (
      tipo !== 'Bearer' ||
      !token
    ) {
      return res.status(401).json({
        error: 'Formato de token inválido.',
      });
    }

    // =========================
    // VALIDAR TOKEN
    // =========================

    const usuario =
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        {
          algorithms: ['HS256'],
        }
      );

    // =========================
    // DISPONIBILIZAR USUÁRIO
    // PARA AS ROTAS
    // =========================

    req.usuario = usuario;

    next();

  } catch (error) {
    console.error(
      'Erro ao validar JWT:',
      error.message
    );

    return res.status(401).json({
      error: 'Token inválido ou expirado.',
    });
  }
}