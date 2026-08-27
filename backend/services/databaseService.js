import pg from 'pg';

const { Pool } = pg;

let pool = null;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      '❌ DATABASE_URL não definida no .env'
    );
  }

  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  pool.on('connect', () => {
    console.log('🟢 Novo cliente conectado ao PostgreSQL');
  });

  pool.on('error', (err) => {
    console.error('🔴 Erro inesperado no PostgreSQL:', err);
  });

  return pool;
}

export function getDatabaseUrl() {
  return process.env.DATABASE_URL;
}

// 🔌 Conexão inicial
export async function connectDatabase() {
  try {
    console.log('🔌 Conectando ao PostgreSQL...');

    const result = await getPool().query('SELECT NOW()');

    console.log('✅ PostgreSQL conectado:', result.rows[0]);

    await getPool().query(`
      ALTER TABLE treinos
        ADD COLUMN IF NOT EXISTS turma_id INTEGER REFERENCES turmas(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS professor_id INTEGER REFERENCES professores(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP DEFAULT NOW()
    `);

  } catch (error) {
    console.error(
      '❌ Falha na conexão com PostgreSQL:',
      error.message
    );

    throw error;
  }
}

// 🧠 Função base para queries (ESSENCIAL)
export async function query(text, params = []) {
  try {
    const res = await getPool().query(text, params);
    return res;

  } catch (error) {
    console.error(
      '❌ Erro na query:',
      error.message
    );

    throw error;
  }
}

// 🔄 Executa uma função dentro de uma transação
export async function transaction(fn) {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default getPool;
