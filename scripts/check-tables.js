/**
 * Script simples para verificar quais tabelas existem no banco de dados.
 * 
 * Como usar:
 *   node scripts/check-tables.js
 */

import pg from 'pg';

const { Client } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Erro: DATABASE_URL não está definida.');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function checkTables() {
  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado!\n');

    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📋 Tabelas encontradas:');
    console.log('------------------------');
    
    if (result.rows.length === 0) {
      console.log('❌ Nenhuma tabela encontrada. O banco está vazio.');
    } else {
      result.rows.forEach(row => {
        console.log(`  ✓ ${row.table_name}`);
      });
    }
    
    console.log('------------------------');
    console.log(`Total: ${result.rows.length} tabela(s)`);

  } catch (error) {
    console.error(`\n❌ Erro: ${error.message}`);
  } finally {
    await client.end();
  }
}

checkTables();
