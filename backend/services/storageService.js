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
 * Colunas pÃƒÂºblicas da tabela alunos.
 *
 * IMPORTANTE:
 * senha NÃƒÆ’O estÃƒÂ¡ aqui.
 *
 * Assim a senha nunca ÃƒÂ© retornada
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
export async function getAlunos(professorId = null) {
  let sql = `
    SELECT
      a.id,
      a.nome,
      a.email,
      a.telefone,
      a.foto,
      a.data_nascimento,
      a.faixa,
      a.graus,
      a.historico_graduacao,
      a.turma,
      a.professor_id,
      a.data_entrada,
      a.ativo,
      a.mensalidade,
      a.valor_mensalidade,
      a.dia_vencimento,
      a.proxima_cobranca,
      a.observacao,
      a.criado_em,
      a.atualizado_em,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', c.id,
            'aluno_id', c.aluno_id,
            'descricao', c.descricao,
            'valor', c.valor,
            'vencimento', c.vencimento,
            'competencia', c.competencia,
            'status', c.status,
            'pago_em', c.pago_em,
            'forma_pagamento', c.forma_pagamento,
            'observacao', c.observacao,
            'criado_em', c.criado_em,
            'atualizado_em', c.atualizado_em
          )
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
      ) AS cobrancas
     FROM alunos a
     LEFT JOIN cobrancas c ON c.aluno_id = a.id
  `;

  const params = [];

  if (professorId !== null) {
    sql += ` WHERE a.professor_id = $1`;
    params.push(professorId);
  }

  sql += `
    GROUP BY a.id
    ORDER BY a.id DESC
  `;

  const result = await query(sql, params);

  return result.rows.map(
    (row) =>
      parseDatabaseFields(
        row,
        [
          'historico_graduacao',
        ]
      )
  );
}


/**
 * Cria um novo aluno.
 *
 * A senha pode ser recebida aqui porque
 * o controller jÃƒÂ¡ deve fazer o hash bcrypt.
 *
 * PorÃƒÂ©m a resposta enviada ao frontend
 * nunca contÃƒÂ©m a senha.
 */
export async function getAluno(
  id
) {
  const result = await query(
    `SELECT
       ${ALUNO_PUBLIC_COLUMNS}
     FROM alunos
     WHERE id = $1`,
    [id]
  );

  const row = result.rows[0];

  if (!row) {
    return undefined;
  }

  return parseDatabaseFields(
    row,
    [
      'historico_graduacao',
    ]
  );
}
export async function addAluno(
  aluno
) {
  /*
   * ALUNOS NÃO POSSUEM SENHA.
   *
   * Remove qualquer campo antigo de senha
   * antes de preparar os dados para o INSERT.
   */
  const {
    senha,
    password,
  cobrancas,
  ...dadosAluno
  } = aluno || {};
  const mappedAluno =
    mapObjectKeys(dadosAluno);


  // Campos de data vazios devem ser enviados como NULL
  // para o PostgreSQL.
  if (mappedAluno.data_nascimento === "") {
    mappedAluno.data_nascimento = null;
  }

  if (mappedAluno.proxima_cobranca === "") {
    mappedAluno.proxima_cobranca = null;
  }
const fields =
    prepareFields(mappedAluno);

  if (!fields.length) {
    throw new Error(
      'Dados de aluno invÃƒÂ¡lidos.'
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
    ]
  );
}


/**
 * Atualiza aluno.
 *
 * A senha pode ser atualizada normalmente,
 * mas nunca serÃƒÂ¡ devolvida na resposta.
 */
export async function updateAluno(
  id,
  aluno
) {
  const {
    senha,
    password,
    cobrancas,
    ...dadosAluno
  } = aluno || {};

  const mappedAluno =
    mapObjectKeys(dadosAluno);

  if (mappedAluno.data_nascimento === "") {
    mappedAluno.data_nascimento = null;
  }

  if (mappedAluno.data_entrada === "") {
    mappedAluno.data_entrada = null;
  }

  if (mappedAluno.proxima_cobranca === "") {
    mappedAluno.proxima_cobranca = null;
  }

  if (mappedAluno.criado_em === "") {
    mappedAluno.criado_em = null;
  }

  if (mappedAluno.atualizado_em === "") {
    mappedAluno.atualizado_em = null;
  }

  if (mappedAluno.valor_mensalidade === "") {
    mappedAluno.valor_mensalidade = null;
  }

  if (mappedAluno.dia_vencimento === "") {
    mappedAluno.dia_vencimento = null;
  }

  const fields =
    prepareFields(mappedAluno);

  if (!fields.length) {
    throw new Error(
      'Nenhum campo vÃƒÂ¡lido para atualizar.'
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
    ]
  );
}


/**
 * Exclui aluno.
 *
 * A resposta tambÃƒÂ©m nÃƒÂ£o retorna senha.
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
   COBRANÃƒâ€¡AS
========================= */

export async function getCobrancas(professorId = null) {
  const params = [];
  let sql = `SELECT * FROM cobrancas`;

  if (professorId !== null) {
    sql += `
     WHERE aluno_id IN (
       SELECT id FROM alunos
       WHERE professor_id = $1
     )`;
    params.push(professorId);
  }

  sql += ` ORDER BY id DESC`;

  const result = await query(sql, params);

  return result.rows;
}

export async function getCobrancaComProfessor(id) {
  const result = await query(
    `SELECT
       c.*,
       a.professor_id
     FROM cobrancas c
     JOIN alunos a ON a.id = c.aluno_id
     WHERE c.id = $1
     LIMIT 1`,
    [id]
  );

  return result.rows[0] || null;
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
   *        Ã¢â€ â€œ
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
      'aluno_id ÃƒÂ© obrigatÃƒÂ³rio para criar uma cobranÃƒÂ§a.'
    );
  }

  const fields =
    prepareFields(
      mappedCobranca
    );

  if (!fields.length) {
    throw new Error(
      'Dados de cobranÃƒÂ§a invÃƒÂ¡lidos.'
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



export async function updateCobranca(
  id,
  cobranca
) {
  const mappedCobranca =
    mapObjectKeys(cobranca);

  const fields =
    prepareFields(mappedCobranca);

  if (!fields.length) {
    throw new Error(
      'Nenhum campo vÃƒÂ¡lido para atualizar.'
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
    `UPDATE cobrancas
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

export async function deleteCobranca(
  id
) {
  const result = await query(
    `DELETE FROM cobrancas
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
}
/* =========================
   PROFESSORES
========================= */

export async function getProfessores(professorId = null) {
  let sql = `SELECT * FROM professores`;
  const params = [];

  if (professorId !== null) {
    sql += ` WHERE id = $1`;
    params.push(professorId);
  }

  sql += ` ORDER BY id DESC`;

  const result = await query(sql, params);

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
      'Nenhum campo vÃƒÂ¡lido para atualizar.'
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



export async function deleteProfessor(
  id
) {
  const result = await query(
    `DELETE FROM professores
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
}
/* =========================
   TURMAS
========================= */

export async function getTurmas() {
  const result = await query(
    `SELECT
       t.*,
       COALESCE(p.nome, t.professor) AS professor,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'aluno_id', ta.aluno_id
           )
         ) FILTER (WHERE ta.aluno_id IS NOT NULL),
         '[]'::json
       ) AS turma_alunos
     FROM turmas t
     LEFT JOIN professores p
       ON p.id = t.professor_id
     LEFT JOIN turma_alunos ta
       ON ta.turma_id = t.id
     GROUP BY t.id, p.nome
     ORDER BY t.id DESC`
  );

  return result.rows.map(
    (row) =>
      parseDatabaseFields(
        row,
        ['alunos', 'turma_alunos']
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
       professor_id,
       alunos
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
      turma.nome,
      turma.professor || null,
      turma.professor_id || null,
      JSON.stringify(
        turma.alunos ??
turma.aluno_ids ??
turma.alunoIds ??
[]
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

/* =========================================================
   BUSCAR TURMA POR ID
========================================================= */

export async function getTurma(
  id
) {
  const result = await query(
    `SELECT
       t.*,
       COALESCE(p.nome, t.professor) AS professor
     FROM turmas t
     LEFT JOIN professores p
       ON p.id = t.professor_id
     WHERE t.id = $1
     LIMIT 1`,
    [id]
  );

  if (!result.rows[0]) {
    return null;
  }

  return parseDatabaseFields(
    result.rows[0],
    ['alunos']
  );
}

/* =========================================================
   ATUALIZAR TURMA
========================================================= */

export async function updateTurma(
  id,
  turma
) {
  const result = await query(
    `UPDATE turmas
     SET
       nome = COALESCE($1, nome),
       professor = COALESCE($2, professor),
       professor_id = COALESCE($3, professor_id),
       alunos = COALESCE($4, alunos),
       atualizado_em = NOW()
     WHERE id = $5
     RETURNING *`,
    [
      turma.nome ?? null,
      turma.professor ?? null,
      turma.professor_id ?? null,
      (
      turma.alunos !== undefined ||
      turma.aluno_ids !== undefined ||
      turma.alunoIds !== undefined
    )
      ? JSON.stringify(
          turma.alunos ??
          turma.aluno_ids ??
          turma.alunoIds ??
          []
        )
      : null,
      id,
    ]
  );

  if (!result.rows[0]) {
    return null;
  }

  return parseDatabaseFields(
    result.rows[0],
    ['alunos']
  );
}

/* =========================================================
   DELETAR TURMA
========================================================= */

export async function deleteTurma(
  id
) {
  const result = await query(
    `DELETE FROM turmas
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  if (!result.rows[0]) {
    return null;
  }

  return parseDatabaseFields(
    result.rows[0],
    ['alunos']
  );
}
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

export async function getPresencasPorTreino(treinoId, dataFiltro = null) {
  let sql = `
    SELECT
      p.id,
      p.aluno_id,
      p.treino_id,
      p.data,
      p.status,
      p.criado_em,
      a.nome AS aluno_nome
    FROM presencas p
    JOIN alunos a ON a.id = p.aluno_id
    WHERE p.treino_id = $1
  `;
  const params = [treinoId];

  if (dataFiltro) {
    sql += ` AND p.data = $2`;
    params.push(dataFiltro);
  }

  sql += ` ORDER BY p.data DESC, a.nome ASC`;

  const result = await query(sql, params);
  return result.rows;
}

export async function updatePresenca(id, dados) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (dados.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(dados.status);
  }
  if (dados.data !== undefined) {
    fields.push(`data = $${paramCount++}`);
    values.push(dados.data);
  }

  if (fields.length === 0) {
    throw new Error('Nenhum campo válido para atualizar.');
  }

  fields.push(`atualizado_em = NOW()`);
  values.push(id);

  const result = await query(
    `UPDATE presencas SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

export async function deletePresenca(id) {
  const result = await query(
    `DELETE FROM presencas WHERE id = $1 RETURNING id`,
    [id]
  );

  return result.rows[0] || null;
}


/* =========================
   GRADUAÃƒâ€¡Ãƒâ€¢ES
   ========================= */

export async function getGraduacoes() {
  const result = await query(
    `SELECT *
     FROM graduacoes
     ORDER BY id DESC`
  );

  return result.rows;
}

export async function getGraduacao(id) {
  const result = await query(
    `SELECT
       g.*,
       a.professor_id
     FROM graduacoes g
     JOIN alunos a ON a.id = g.aluno_id
     WHERE g.id = $1
     LIMIT 1`,
    [id]
  );

  return result.rows[0] || null;
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
export async function updateGraduacao(
  id,
  graduacao
) {
  const mappedGraduacao =
    mapObjectKeys(graduacao);

  const fields =
    prepareFields(mappedGraduacao);

  if (!fields.length) {
    throw new Error(
      'Nenhum campo vÃƒÂ¡lido para atualizar.'
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
    `UPDATE graduacoes
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

export async function deleteGraduacao(
  id
) {
  const result = await query(
    `DELETE FROM graduacoes
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
}

/* =========================
   PIX CONFIG
   ========================= */

export async function getPixConfig() {
  const result = await query(
    `SELECT
       id,
       chave_pix,
       nome_recebedor,
       cidade_recebedor,
       criado_em,
       atualizado_em
     FROM pix_config
     ORDER BY id ASC
     LIMIT 1`
  );

  return result.rows[0] || null;
}

export async function updatePixConfig(
  id,
  dados
) {
  const mapped =
    mapObjectKeys(dados);

  const fields =
    prepareFields(mapped);

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
    `UPDATE pix_config
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

export async function updateFirstPixConfig(
  dados
) {
  const mapped =
    mapObjectKeys(dados);

  const fields =
    prepareFields(mapped);

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
    `UPDATE pix_config
     SET
       ${columns.join(', ')}
     WHERE id = (
       SELECT id FROM pix_config
       ORDER BY id ASC
       LIMIT 1
     )
     RETURNING *`,
    values
  );

  if (result.rows.length > 0) {
    return result.rows[0];
  }

  const insertResult = await query(
    `INSERT INTO pix_config
      (chave_pix, nome_recebedor, cidade_recebedor)
     VALUES
      ($1, $2, $3)
     RETURNING *`,
    [
      dados.chave_pix || '',
      dados.nome_recebedor || 'DOJO LB',
      dados.cidade_recebedor || 'SAO PAULO',
    ]
  );

  return insertResult.rows[0];
}

/* =========================
   PIX CHAVES (múltiplas chaves)
   ========================= */

export async function getPixChaves() {
  const result = await query(
    `SELECT
       id,
       nome_identificacao,
       chave_pix,
       tipo,
       descricao,
       ativo,
       criado_em,
       atualizado_em
     FROM pix_chaves
     ORDER BY id ASC`
  );

  return result.rows;
}

export async function getPixChave(id) {
  const result = await query(
    `SELECT
       id,
       nome_identificacao,
       chave_pix,
       tipo,
       descricao,
       ativo,
       criado_em,
       atualizado_em
     FROM pix_chaves
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function getPixChavesAtivas() {
  const result = await query(
    `SELECT
       id,
       nome_identificacao,
       chave_pix,
       tipo,
       descricao,
       ativo,
       criado_em,
       atualizado_em
     FROM pix_chaves
     WHERE ativo = TRUE
     ORDER BY id ASC`
  );

  return result.rows;
}

export async function addPixChave(chave) {
  const mapped =
    mapObjectKeys(chave);

  const fields =
    prepareFields(mapped);

  if (!fields.length) {
    throw new Error(
      'Nenhum campo válido para adicionar chave PIX.'
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
    `INSERT INTO pix_chaves
       (${columns})
     VALUES
       (${placeholders})
     RETURNING *`,
    values
  );

  return result.rows[0];
}

export async function updatePixChave(id, chave) {
  const mapped =
    mapObjectKeys(chave);

  const fields =
    prepareFields(mapped);

  if (!fields.length) {
    throw new Error(
      'Nenhum campo válido para atualizar chave PIX.'
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
    `UPDATE pix_chaves
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

export async function deletePixChave(id) {
  const result = await query(
    `DELETE FROM pix_chaves
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return result.rows[0] || null;
}