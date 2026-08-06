import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import alunosRoutes from './routes/alunos.js';
import cobrancasRoutes from './routes/cobrancas.js';
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

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'API Dojo LB rodando 🚀',
    backend: 'postgres-version',
  });
});

app.use('/alunos', alunosRoutes);
app.use('/cobrancas', cobrancasRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada.',
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