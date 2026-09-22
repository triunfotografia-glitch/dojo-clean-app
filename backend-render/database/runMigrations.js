import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const MIGRATION_VERSION = '001_add_chamadas';
const ADVISORY_LOCK_KEY = 4815162342;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const migrationPath = path.join(
  __dirname,
  'migrations',
  `${MIGRATION_VERSION}.sql`
);

dotenv.config({
  path: path.join(projectRoot, 'backend', '.env'),
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL não definida.');
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized:
      String(
        process.env.DATABASE_SSL_REJECT_UNAUTHORIZED || 'false'
      ).toLowerCase() === 'true',
  },
});

let lockAcquired = false;

async function runMigrations() {
  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query(
      'SELECT pg_advisory_lock($1::bigint)',
      [ADVISORY_LOCK_KEY]
    );
    lockAcquired = true;

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    const applied = await client.query(
      `SELECT 1
       FROM schema_migrations
       WHERE version = $1`,
      [MIGRATION_VERSION]
    );

    if (applied.rowCount === 0) {
      const migration = fs.readFileSync(
        migrationPath,
        'utf8'
      );

      await client.query(migration);
      await client.query(
        `INSERT INTO schema_migrations (version)
         VALUES ($1)`,
        [MIGRATION_VERSION]
      );

      console.log(
        `Migration ${MIGRATION_VERSION} aplicada.`
      );
    } else {
      console.log(
        `Migration ${MIGRATION_VERSION} já aplicada.`
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error(
        'Falha ao executar rollback da migration:',
        rollbackError
      );
    }

    throw new Error(
      `Falha ao executar migrations: ${error.message}`,
      { cause: error }
    );
  } finally {
    if (lockAcquired) {
      try {
        await client.query(
          'SELECT pg_advisory_unlock($1::bigint)',
          [ADVISORY_LOCK_KEY]
        );
      } catch (unlockError) {
        console.error(
          'Falha ao liberar advisory lock:',
          unlockError
        );
      }
    }

    await client.end();
  }
}

runMigrations().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
