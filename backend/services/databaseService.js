export function getDatabaseUrl() {
  return process.env.DATABASE_URL || null;
}

export async function connectDatabase() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    console.log('DATABASE_URL not configured. Using in-memory storage.');
    return;
  }

  console.log(`Database connection will use: ${databaseUrl}`);
  console.log('Database integration is not implemented yet.');
}
