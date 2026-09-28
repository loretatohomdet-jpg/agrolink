import postgres from 'postgres';

// Cache database connection in development to avoid creating new connections during hot-reloads
const globalForDb = global as unknown as { sql: ReturnType<typeof postgres> | undefined };

const connectionString = process.env.DATABASE_URL || 'postgresql://apple@localhost:5432/agrolink';

export const sql = globalForDb.sql ?? postgres(connectionString, {
  // Automatically configure SSL if connecting to Supabase or other hosted databases
  ssl: connectionString.includes('supabase.co') || connectionString.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql;
}

export default sql;
