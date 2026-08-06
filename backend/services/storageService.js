import { query } from './databaseService.js';

export async function getAlunos() {
  const result = await query('SELECT * FROM alunos ORDER BY id DESC');
  return result.rows;
}

export async function addAluno(aluno) {
  const result = await query(
    'INSERT INTO alunos (nome) VALUES ($1) RETURNING *',
    [aluno.nome],
  );
  return result.rows[0];
}

export async function getCobrancas() {
  const result = await query('SELECT * FROM cobrancas ORDER BY id DESC');
  return result.rows;
}

export async function addCobranca(cobranca) {
  const fields = Object.entries(cobranca || {}).filter(([key]) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key));

  if (!fields.length) {
    throw new Error('Dados de cobrança inválidos.');
  }

  const columns = fields.map(([key]) => key).join(', ');
  const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
  const values = fields.map(([, value]) => value);

  const result = await query(
    `INSERT INTO cobrancas (${columns}) VALUES (${placeholders}) RETURNING *`,
    values,
  );

  return result.rows[0];
}
