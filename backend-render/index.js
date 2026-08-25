import 'dotenv/config';

import cors from 'cors';
import express from 'express';

// Middleware de autenticação JWT
import { authMiddleware } from './middleware/authMiddleware.js';

// Rotas
import alunosRoutes from './routes/alunos.js';
import authRoutes from './routes/auth.js';
import campeonatosRoutes from './routes/campeonatos.js';
import cobrancasRoutes from './routes/cobrancas.js';
import graduacoesRoutes from './routes/graduacoes.js';
import pixRoutes from './routes/pix.js';
import presencasRoutes from './routes/presencas.js';
import professoresRoutes from './routes/professores.js';
import treinosRoutes from './routes/treinos.js';
import turmasRoutes from './routes/turmas.js';

// Conexão com banco
import { connectDatabase } from './services/databaseService.js';

// Diagnóstico SMTP
import { transporter, isEmailConfigured } from './services/emailService.js';

const app = express();

app.set('trust proxy', 1);

console.log('🚀 BACKEND DOJO LB - POSTGRESQL');

// ==============================
// DEBUG
// ==============================

// Pode remover depois.
// NÃO exiba DATABASE_URL em produção,
// pois ela contém credenciais sensíveis.
console.log(
  'DATABASE_URL configurada:',
  Boolean(process.env.DATABASE_URL)
);

// ==============================
// MIDDLEWARES GERAIS
// ==============================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  })
);

app.use(
  express.json({
    limit: '1mb',
  })
);

// ==============================
// LOG DE REQUISIÇÕES
// ==============================

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );

    next();
  });
}

// ==============================
// ROTA BASE
// ==============================

app.get('/', (req, res) => {
  res.json({
    status: 'online',
  });
});

// ==============================
// AUTENTICAÇÃO
// ==============================

// IMPORTANTE:
// /auth permanece público.
// É através dele que o professor
// obtém o JWT para acessar o sistema.

app.use('/auth', authRoutes);

// ==============================
// ROTAS PROTEGIDAS
// ==============================

// IMPORTANTE:
// Por enquanto estamos protegendo
// as rotas inteiras.
// O login continua público acima.

app.use(
  '/alunos',
  authMiddleware,
  alunosRoutes
);

app.use(
  '/cobrancas',
  authMiddleware,
  cobrancasRoutes
);

app.use(
  '/professores',
  authMiddleware,
  professoresRoutes
);

app.use(
  '/turmas',
  authMiddleware,
  turmasRoutes
);

app.use(
  '/treinos',
  authMiddleware,
  treinosRoutes
);

app.use(
  '/presencas',
  authMiddleware,
  presencasRoutes
);

app.use(
  '/graduacoes',
  authMiddleware,
  graduacoesRoutes
);

app.use(
  '/pix',
  authMiddleware,
  pixRoutes
);

app.use(
  '/campeonatos',
  authMiddleware,
  campeonatosRoutes
);

// ==============================
// DIAGNÓSTICO SMTP
// ==============================

app.get('/diagnostico/smtp', async (req, res) => {
  console.log('[DIAG SMTP] Iniciando teste de conexão SMTP...');

  if (!isEmailConfigured()) {
    console.log('[DIAG SMTP] E-mail não configurado.');
    return res.status(500).json({
      success: false,
      error: 'E-mail não configurado.',
    });
  }

  try {
    const result = await transporter.verify();

    console.log('[DIAG SMTP] Conexão SMTP OK');

    res.json({
      success: true,
      host: process.env.EMAIL_HOST || '',
      port: Number(process.env.EMAIL_PORT || '587'),
      secure: String(process.env.EMAIL_SECURE || 'false').toLowerCase() === 'true',
      result,
    });
  } catch (error) {
    console.error('[DIAG SMTP] Erro:', error.code, error.command, error.address, error.port);

    res.status(500).json({
      success: false,
      host: process.env.EMAIL_HOST || '',
      port: Number(process.env.EMAIL_PORT || '587'),
      secure: String(process.env.EMAIL_SECURE || 'false').toLowerCase() === 'true',
      error: error.message,
      code: error.code,
      command: error.command,
      address: error.address,
      port: error.port,
    });
  }
});

// ==============================
// 404
// ==============================

app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

// ==============================
// TRATAMENTO DE ERROS
// ==============================

app.use(
  (error, req, res, next) => {
    console.error(
      'Erro não tratado:',
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      error: 'Erro interno do servidor.',
    });
  }
);

// ==============================
// PORTA
// ==============================

const PORT =
  process.env.PORT || 3000;

// ==============================
// INICIALIZAÇÃO
// ==============================

async function startServer() {
  try {
    console.log(
      '🔌 Conectando ao banco...'
    );

    await connectDatabase();

    console.log(
      '✅ Banco conectado com sucesso'
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `🌐 Servidor rodando em http://localhost:${PORT}`
        );
      }
    );

  } catch (error) {
    console.error(
      '❌ Erro ao conectar no banco:',
      error.message
    );

    process.exit(1);
  }
}

startServer();