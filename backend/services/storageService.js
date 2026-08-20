import { query } from './databaseService.js';

/* =========================
   HELPERS
========================= */

/**
 * Converte uma string camelCase para snake_case.
 *
 * Ex:
 * alunoId -> aluno_id
 * historicoGraduacao -> historico_graduacao
 */
function camelToSnake(str) {
  return str
    .replace(
      /([a-z0-9])([A-Z])/g,
      '$1_$2'
    )
    .toLowerCase();
}

/**
 * Mapeia todas as chaves de camelCase
 * para snake_case.
 */
function mapObjectKeys(obj) {
  if (
    !obj ||
    typeof obj !== 'object' ||
    Array.isArray(obj)
  ) {
    return obj;
  }

  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value;
  }

  return result;
}

/**
 * Faz parse dos campos JSON retornados
 * pelo PostgreSQL.
 */
function parseDatabaseFields(
  row,
  fields = []
) {
  if (!row) {
    return row;
  }

  fields.forEach((field) => {
    if (
      row[field] &&
      typeof row[field] === 'string'
    ) {
      try {
        row[field] =
          JSON.parse(row[field]);
      } catch {
        row[field] = [];
      }
    }
  });

  return row;
}

/* Alias mantido para compatibilidade */
const parseJSONFields =
  parseDatabaseFields;

/**
 * Prepara os campos enviados ao PostgreSQL.
 */
function prepareFields(data) {
  return Object.entries(
    data || {}
  ).filter(
    ([key, value]) =>
      key !== 'id' &&
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(
        key
      ) &&
      value !== undefined
  );
}


/* =========================
   ALUNOS
========================= */

/**
 * Colunas públicas da tabela alunos.
 *
 * IMPORTANTE:
 * senha NÃO está aqui.
 *
 * Assim a senha nunca é retornada
 * pela API de alunos.
 */
const ALUNO_PUBLIC_COLUMNS = `
  id,
  nome,
  email,
  telefone,
  foto,
  data_nascimento,
  faixa,
  graus,
  historico_graduacao,
  turma,
  professor_id,
  data_entrada,
  ativo,
  mensalidade,
  valor_mensalidade,
  dia_vencimento,
  proxima_cobranca,
  observacao,
  criado_em,
  atualizado_em
`;


/**
 * Busca todos os alunos sem retornar senha.
 */
export async function getAlunos() {
  const result = await query(
    `SELECT
      ${ALUNO_PUBLIC_COLUMNS}
     FROM alunos
     ORDER BY id DESC`
  );

  return result.rows.map(
    (row) =>
      parseDatabaseFields(
        row,
        [
          'historico_graduacao',
          'cobrancas',
        ]
      )
  );
}


/**
 * Cria um novo aluno.
 *
 * A senha pode ser recebida aqui porque
 * o controller já deve fazer o hash bcrypt.
 *
 * Porém a resposta enviada ao frontend
 * nunca contém a senha.
 */
export async function addAluno(
  aluno
) {
  const mappedAluno =
    mapObjectKeys(aluno);

  const fields =
    prepareFields(mappedAluno);

  if (!fields.length) {
    throw new Error(
      'Dados de aluno inválidos.'
    );
  }

  const columns =
    fields
      .map(([key]) => key)
      .join(', ');

  const placeholders =
    fields
      .map((_, i) => `$${i + 1}`)
      .join(', ');

  const values =
    fields.map(
      ([key, value]) => {
        if (
          [
            'historico_graduacao',
            'cobrancas',
          ].includes(key)
        ) {
          return JSON.stringify(
            value || []
          );
        }

        return value;
      }
    );

  const result = await query(
    `INSERT INTO alunos
      (${columns})
     VALUES
      (${placeholders})
     RETURNING
      ${ALUNO_PUBLIC_COLUMNS}`,
    values
  );

  return parseDatabaseFields(
    result.rows[0],
    [
      'historico_graduacao',
      'cobrancas',
    ]
  );
}


/**
 * Atualiza aluno.
 *
 * A senha pode ser atualizada normalmente,
 * mas nunca será devolvida na resposta.
 */
export async function updateAluno(
  id,
  aluno
) {
  const mappedAluno =
    mapObjectKeys(aluno);

  const fields =
    prepareFields(mappedAluno);

  if (!fields.length) {
    throw new Error(
      'Nenhum campo válido para atualizar.'
    );
  }

  const columns =
    fields.map(
      ([key], i) =>
        `${key} = $${i + 1}`
    );

  const values =
    fields.map(
      ([key, value]) => {
        if (
          [
            'historico_graduacao',
            'cobrancas',
          ].includes(key)
        ) {
          return JSON.stringify(
            value || []
          );
        }

        return value;
      }
    );

  const result = await query(
    `UPDATE alunos
     SET
       ${columns.join(', ')}
     WHERE id = $${values.length + 1}
     RETURNING
       ${ALUNO_PUBLIC_COLUMNS}`,
    [
      ...values,
      id,
    ]
  );

  return parseDatabaseFields(
    result.rows[0],
    [
      'historico_graduacao',
      'cobrancas',
    ]
  );
}


/**
 * Exclui aluno.
 *
 * A resposta também não retorna senha.
 */
export async function deleteAluno(
  id
) {
  const result = await query(
    `DELETE FROM alunos
     WHERE id = $1
     RETURNING
       ${ALUNO_PUBLIC_COLUMNS}`,
    [id]
  );

  return result.rows[0];
}


/* =========================
   COBRANÇAS
========================= */

export async function getCobrancas() {
  const result = await query(
    `SELECT *
     FROM cobrancas
     ORDER BY id DESC`
  );

  return result.rows;
}


export async function addCobranca(
  cobranca
) {
  const mappedCobranca =
    mapObjectKeys(cobranca);

  /*
   * A tabela cobrancas possui:
   *
   * aluno_id INTEGER NOT NULL
   *
   * FK:
   *
   * cobrancas.aluno_id
   *        ↓
   * alunos.id
   */

  if (
    mappedCobranca.aluno_id ===
      undefined ||
    mappedCobranca.aluno_id ===
      null ||
    mappedCobranca.aluno_id === ''
  ) {
    throw new Error(
      'aluno_id é obrigatório para criar uma cobrança.'
    );
  }

  const fields =
    prepareFields(
      mappedCobranca
    );

  if (!fields.length) {
    throw new Error(
      'Dados de cobrança inválidos.'
    );
  }

  const columns =
    fields
      .map(([key]) => key)
      .join(', ');

  const placeholders =
    fields
      .map((_, i) => `$${i + 1}`)
      .join(', ');

  const values =
    fields.map(
      ([, value]) => value
    );

  const result = await query(
    `INSERT INTO cobrancas
      (${columns})
     VALUES
      (${placeholders})
     RETURNING *`,
    values
  );

  return result.rows[0];
}


/* =========================
   PROFESSORES
========================= */

export async function getProfessores() {
  const result = await query(
    `SELECT *
     FROM professores
     ORDER BY id DESC`
  );

  return result.rows;
}


export async function addProfessor(
  professor
) {
  const result = await query(
    `INSERT INTO professores
     (
       nome,
       email,
       senha,
       telefone,
       faixa,
       graus,
       especialidade,
       ativo
     )
     VALUES
     (
       $1,
       $2,
       $3,
       $4,
       $5,
       $6,
       $7,
       $8
     )
     RETURNING *`,
    [
      professor.nome,
      professor.email,
      professor.senha,
      professor.telefone,
      professor.faixa,
      professor.graus,
      professor.especialidade,
      professor.ativo,
    ]
  );

  return result.rows[0];
}


export async function updateProfessor(
  id,
  professor
) {
  const mappedProfessor =
    mapObjectKeys(professor);

  const fields =
    prepareFields(
      mappedProfessor
    );

  if (!fields.length) {
    throw new Error(
      'Nenhum campo válido para atualizar.'
    );
  }

  const columns =
    fields.map(
      ([key], i) =>
        `${key} = $${i + 1}`
    );

  const values =
    fields.map(
      ([, value]) => value
    );

  const result = await query(
    `UPDATE professores
     SET
       ${columns.join(', ')}
     WHERE id = $${values.length + 1}
     RETURNING *`,
    [
      ...values,
      id,
    ]
  );

  return result.rows[0];
}


/* =========================
   TURMAS
========================= */

export async function getTurmas() {
  const result = await query(
    `SELECT *
     FROM turmas
     ORDER BY id DESC`
  );

  return result.rows.map(
    (row) =>
      parseDatabaseFields(
        row,
        ['alunos']
      )
  );
}


export async function addTurma(
  turma
) {
  const result = await query(
    `INSERT INTO turmas
     (
       nome,
       professor,
       alunos
     )
     VALUES
     (
       $1,
       $2,
       $3
     )
     RETURNING *`,
    [
      turma.nome,
      turma.professor,
      JSON.stringify(
        turma.alunos || []
      ),
    ]
  );

  return parseDatabaseFields(
    result.rows[0],
    ['alunos']
  );
}


/* =========================
   TREINOS
========================= */

export async function getTreinos() {
  const result = await query(
    `SELECT *
     FROM treinos
     ORDER BY id DESC`
  );

  return result.rows;
}

/* =========================================================
BUSCAR TREINO POR ID
========================================================= */

export async function getTreino(
  id
) {
  const result = await query(
    `SELECT *
     FROM treinos
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  if (!result.rows[0]) {
    return null;
  }

  return result.rows[0];
}

/* =========================================================
CRIAR TREINO
========================================================= */

export async function addTreino(
  treino
) {
  const result = await query(
    `INSERT INTO treinos
     (
       nome,
       dia,
       horario,
       turma,
       turma_id,
       professor,
       professor_id
     )
     VALUES
     (
       $1,
       $2,
       $3,
       $4,
       $5,
       $6,
       $7
     )
     RETURNING *`,
    [
      treino.nome,
      treino.dia || null,
      treino.horario || null,
      treino.turma || null,
      treino.turma_id || null,
      treino.professor || null,
      treino.professor_id || null,
    ]
  );

  return result.rows[0];
}

/* =========================================================
ATUALIZAR TREINO
========================================================= */

export async function updateTreino(
  id,
  treino
) {
  const result = await query(
    `UPDATE treinos
     SET
       nome = COALESCE($1, nome),
       dia = COALESCE($2, dia),
       horario = COALESCE($3, horario),
       turma = COALESCE($4, turma),
       turma_id = COALESCE($5, turma_id),
       professor = COALESCE($6, professor),
       professor_id = COALESCE($7, professor_id),
       atualizado_em = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      treino.nome ?? null,
      treino.dia ?? null,
      treino.horario ?? null,
      treino.turma ?? null,
      treino.turma_id ?? null,
      treino.professor ?? null,
      treino.professor_id ?? null,
      id,
    ]
  );

  if (!result.rows[0]) {
    return null;
  }

  return result.rows[0];
}

/* =========================================================
DELETAR TREINO
========================================================= */

export async function deleteTreino(
  id
) {
  const result = await query(
    `DELETE FROM treinos
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  if (!result.rows[0]) {
    return null;
  }

  return result.rows[0];
}
/* =========================
   PRESENÇAS
========================= */

export async function getPresencas() {
  const result = await query(
    `SELECT *
     FROM presencas
     ORDER BY id DESC`
  );

  return result.rows;
}


export async function addPresenca(
  presenca
) {
  const result = await query(
    `INSERT INTO presencas
     (
       aluno_id,
       treino_id,
       data,
       status
     )
     VALUES
     (
       $1,
       $2,
       $3,
       $4
     )
     RETURNING *`,
    [
      presenca.aluno_id,
      presenca.treino_id,
      presenca.data,
      presenca.status,
    ]
  );

  return result.rows[0];
}


/* =========================
   GRADUAÇÕES
========================= */

export async function getGraduacoes() {
  const result = await query(
    `SELECT *
     FROM graduacoes
     ORDER BY id DESC`
  );

  return result.rows;
}


export async function addGraduacao(
  graduacao
) {
  const result = await query(
    `INSERT INTO graduacoes
     (
       aluno_id,
       faixa,
       data,
       professor,
       observacao
     )
     VALUES
     (
       $1,
       $2,
       $3,
       $4,
       $5
     )
     RETURNING *`,
    [
      graduacao.aluno_id,
      graduacao.faixa,
      graduacao.data,
      graduacao.professor,
      graduacao.observacao,
    ]
  );

  return result.rows[0];
}