/**
 * Script de migração para o banco de dados PostgreSQL.
 * 
 * Como usar:
 *   node scripts/run-migrations.js <caminho-do-arquivo-sql>
 * 
 * Exemplo:
 *   node scripts/run-migrations.js backend/database/migrations/001_fix_presencas_cascade.sql
 */

import fs from 'fs';
import pg from 'pg';

const { Client } = pg;

// Obter o caminho do arquivo SQL dos argumentos
const sqlFile = process.argv[2];

if (!sqlFile) {
  console.error('❌ Erro: Informe o caminho do arquivo SQL.');
  console.log('   Exemplo: node scripts/run-migrations.js backend/database/migrations/001_fix_presencas_cascade.sql');
  process.exit(1);
}

// Verificar se o arquivo existe
if (!fs.existsSync(sqlFile)) {
  console.error(`❌ Erro: Arquivo não encontrado: ${sqlFile}`);
  process.exit(1);
}

// Obter a string de conexão do banco de dados
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Erro: DATABASE_URL não está definida.');
  console.log('   Defina a variável de ambiente DATABASE_URL antes de executar.');
  process.exit(1);
}

// Criar cliente do PostgreSQL
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  try {
    console.log(`🔌 Conectando ao banco de dados...`);
    await client.connect();
    console.log(`✅ Conectado com sucesso!`);

    console.log(`\n📄 Lendo arquivo: ${sqlFile}`);
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    console.log(`\n🚀 Executando migração...\n`);
    await client.query(sql);

    console.log(`\n✅ Migração executada com sucesso!`);

  } catch (error) {
    console.error(`\n❌ Erro ao executar migração:`);
    console.error(`   ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
