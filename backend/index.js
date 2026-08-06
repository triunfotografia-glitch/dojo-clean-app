import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import alunosRoutes from './routes/alunos.js';
import cobrancasRoutes from './routes/cobrancas.js';
import graduacoesRoutes from './routes/graduacoes.js';
import presencasRoutes from './routes/presencas.js';
import professoresRoutes from './routes/professores.js';
import treinosRoutes from './routes/treinos.js';
import turmasRoutes from './routes/turmas.js';

import { connectDatabase } from './services/databaseService.js';

const app = express();

console.log('BACKEND CORRETO - POSTGRES VERSION');

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

// Teste da API
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'API Dojo LB rodando 🚀',
    backend: 'postgres-version',
  });
});

// Rotas existentes
app.use('/alunos', alunosRoutes);
app.use('/cobrancas', cobrancasRoutes);

// Novas rotas PostgreSQL
app.use('/professores', professoresRoutes);
app.use('/turmas', turmasRoutes);
app.use('/treinos', treinosRoutes);
app.use('/presencas', presencasRoutes);
app.use('/graduacoes', graduacoesRoutes);

// Tratamento de rota inexistente
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada.',
    route: req.originalUrl,
  });
});

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error(
      'Falha ao conectar ao banco de dados:',
      error.message
    );

    process.exit(1);
  }
}

startServer();