import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL environment variable is required to connect to PostgreSQL.'
  );
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export function getDatabaseUrl() {
  return connectionString;
}

export async function connectDatabase() {
  try {
    console.log('Connecting to PostgreSQL...');

    await pool.query('SELECT 1');

    console.log('PostgreSQL connected successfully.');

  } catch (error) {
    console.error(
      'PostgreSQL connection failed:',
      error.message
    );

    throw error;
  }
}

export async function query(text, params = []) {
  try {
    return await pool.query(text, params);

  } catch (error) {
    console.error(
      'Database query error:',
      error.message
    );

    throw error;
  }
}

export default pool;