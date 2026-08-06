import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import alunosRoutes from './routes/alunos.js';
import cobrancasRoutes from './routes/cobrancas.js';
import { connectDatabase } from './services/databaseService.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => {
  res.send('API rodando 🚀');
});

app.use('/alunos', alunosRoutes);
app.use('/cobrancas', cobrancasRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

const PORT = Number(process.env.PORT) || 3000;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});
