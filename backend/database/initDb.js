import fs from "fs";
import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
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