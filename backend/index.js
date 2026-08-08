import 'dotenv/config'; // 🔥 TEM QUE SER A PRIMEIRA LINHA

import cors from 'cors';
import express from 'express';

// Rotas
import alunosRoutes from './routes/alunos.js';
import authRoutes from './routes/auth.js';
import cobrancasRoutes from './routes/cobrancas.js';
import graduacoesRoutes from './routes/graduacoes.js';
import presencasRoutes from './routes/presencas.js';
import professoresRoutes from './routes/professores.js';
import treinosRoutes from './routes/treinos.js';
import turmasRoutes from './routes/turmas.js';

// Conexão com banco
import { connectDatabase } from './services/databaseService.js';

const app = express();

console.log('🚀 BACKEND DOJO LB - POSTGRESQL');

// 🔍 DEBUG (pode remover depois)
console.log('ENV DATABASE_URL:', process.env.DATABASE_URL);

// Middlewares
app.use(cors());
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

// Rota base
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'API Dojo LB rodando 🚀',
    database: 'PostgreSQL',
  });
});

// Rotas
app.use('/auth', authRoutes);
app.use('/alunos', alunosRoutes);
app.use('/cobrancas', cobrancasRoutes);
app.use('/professores', professoresRoutes);
app.use('/turmas', turmasRoutes);
app.use('/treinos', treinosRoutes);
app.use('/presencas', presencasRoutes);
app.use('/graduacoes', graduacoesRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

// Porta
const PORT = process.env.PORT || 3000;

// Inicialização
async function startServer() {
  try {
    console.log('🔌 Conectando ao banco...');

    await connectDatabase();

    console.log('✅ Banco conectado com sucesso');

    app.listen(PORT, () => {
      console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Erro ao conectar no banco:', error.message);
    process.exit(1);
  }
}

startServer();