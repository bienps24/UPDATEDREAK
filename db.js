const pool = new Pool({
  // Palitan ang POSTGRES_URL sa DATABASE_URL
  connectionString: process.env.DATABASE_URL, 
  max: 10,
  idleTimeoutMillis: 30000
});
