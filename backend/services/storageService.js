import { query } from './databaseService.js';

export async function getAlunos() {
  const result = await query('SELECT * FROM alunos ORDER BY id DESC');
  return result.rows;
}

export async function addAluno(aluno) {
  const fields = Object.entries(aluno || {})
    .filter(
      ([key, value]) =>
        key !== 'id' &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) &&
        value !== undefined
    );

  if (!fields.length) {
    throw new Error('Dados de aluno inválidos.');
  }

  const columns = fields
    .map(([key]) => key)
    .join(', ');

  const placeholders = fields
    .map((_, index) => `$${index + 1}`)
    .join(', ');

  const values = fields.map(([key, value]) => {
    if (
      key === 'historicoGraduacao' ||
      key === 'cobrancas'
    ) {
      return JSON.stringify(value || []);
    }

    return value;
  });

  const result = await query(
    `
    INSERT INTO alunos (${columns})
    VALUES (${placeholders})
    RETURNING *
    `,
    values,
  );

  return result.rows[0];
}

export async function updateAluno(id, aluno) {
  const fields = Object.entries(aluno || {})
    .filter(
      ([key, value]) =>
        key !== 'id' &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) &&
        value !== undefined,
    );

  if (!fields.length) {
    throw new Error('Nenhum campo válido para atualizar.');
  }

  const columns = fields.map(([key], index) => `${key} = $${index + 1}`);
  const values = fields.map(([, value]) => value);

  const queryText = `
    UPDATE alunos 
    SET ${columns.join(', ')}
    WHERE id = $${values.length + 1}
    RETURNING *
  `;

  const result = await query(queryText, [...values, id]);

  return result.rows[0];
}

export async function deleteAluno(id) {
  const result = await query(
    'DELETE FROM alunos WHERE id = $1 RETURNING *',
    [id],
  );

  return result.rows[0];
}

export async function getCobrancas() {
  const result = await query('SELECT * FROM cobrancas ORDER BY id DESC');
  return result.rows;
}

export async function addCobranca(cobranca) {
  const fields = Object.entries(cobranca || {})
    .filter(([key]) =>
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)
    );

  if (!fields.length) {
    throw new Error('Dados de cobrança inválidos.');
  }

  const columns = fields
    .map(([key]) => key)
    .join(', ');

  const placeholders = fields
    .map((_, index) => `$${index + 1}`)
    .join(', ');

  const values = fields.map(([, value]) => value);

  const result = await query(
    `INSERT INTO cobrancas (${columns}) VALUES (${placeholders}) RETURNING *`,
    values,
  );

  return result.rows[0];
}

export async function getProfessores() {
  const result = await query('SELECT * FROM professores ORDER BY id DESC');
  return result.rows;
}

export async function addProfessor(professor) {
  const result = await query(
    'INSERT INTO professores (nome, email, senha, telefone, faixa, graus, especialidade, ativo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [
      professor.nome,
      professor.email,
      professor.senha,
      professor.telefone,
      professor.faixa,
      professor.graus,
      professor.especialidade,
      professor.ativo,
    ],
  );

  return result.rows[0];
}

export async function getTurmas() {
  const result = await query('SELECT * FROM turmas ORDER BY id DESC');
  return result.rows;
}

export async function addTurma(turma) {
  const result = await query(
    'INSERT INTO turmas (nome, professor, alunos) VALUES ($1, $2, $3) RETURNING *',
    [
      turma.nome,
      turma.professor,
      JSON.stringify(turma.alunos || [])
    ],
  );

  return result.rows[0];
}

export async function getTreinos() {
  const result = await query('SELECT * FROM treinos ORDER BY id DESC');
  return result.rows;
}

export async function addTreino(treino) {
  const result = await query(
    'INSERT INTO treinos (nome, dia, horario, turma, professor) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [
      treino.nome,
      treino.dia,
      treino.horario,
      treino.turma,
      treino.professor
    ],
  );

  return result.rows[0];
}

export async function getPresencas() {
  const result = await query('SELECT * FROM presencas ORDER BY id DESC');
  return result.rows;
}

export async function addPresenca(presenca) {
  const result = await query(
    'INSERT INTO presencas (alunoId, treinoId, data, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [
      presenca.alunoId,
      presenca.treinoId,
      presenca.data,
      presenca.status
    ],
  );

  return result.rows[0];
}

export async function getGraduacoes() {
  const result = await query('SELECT * FROM graduacoes ORDER BY id DESC');
  return result.rows;
}

export async function addGraduacao(graduacao) {
  const result = await query(
    'INSERT INTO graduacoes (alunoId, faixa, data, professor, observacao) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [
      graduacao.alunoId,
      graduacao.faixa,
      graduacao.data,
      graduacao.professor,
      graduacao.observacao
    ],
  );

  return result.rows[0];
}