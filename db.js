import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = process.env.DATABASE_URL
  ? new Pool({
      // Se existir DATABASE_URL (produção/Vercel), usa-a.
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, //Supabase exige SSL. Sem isto, a ligação falha.
    })
  : new Pool({
      // Senão, usa as variáveis locais.
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

// Teste de conexão
pool
  .connect()
  .then((client) => {
    console.log("✅ OK::Conectado ao Banco de Dados");
    client.release();
  })
  .catch((err) => {
    console.error("❌ ERROR::Erro ao ligar ao Banco de Dados:", err.message);
  });

export default pool;
