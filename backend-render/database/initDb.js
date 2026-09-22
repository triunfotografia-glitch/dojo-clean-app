import fs from "fs";
import pkg from "pg";
const { Client } = pkg;

if (!['development', 'test'].includes(process.env.NODE_ENV)) {
  throw new Error(
    'initDb só pode ser executado explicitamente em development ou test.'
  );
}

const databaseUrl = process.env.DATABASE_URL || '';

function isRenderDatabase(url) {
  try {
    return new URL(url).hostname.endsWith('.render.com');
  } catch {
    return false;
  }
}

if (isRenderDatabase(databaseUrl)) {
  throw new Error(
    'initDb não pode ser executado contra um banco Render.'
  );
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function runSchema() {
  try {
    await client.connect();
    console.log("Conectado ao banco");

    const schema = fs.readFileSync("./database/schema.sql", "utf-8");

    await client.query(schema);

    console.log("Schema aplicado com sucesso!");
  } catch (err) {
    console.error("Erro ao aplicar schema:", err);
  } finally {
    await client.end();
  }
}

runSchema();