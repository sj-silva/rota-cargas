import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Teste de conexão
pool.connect()
  .then(client => {
    console.log('✅OK::Conectado ao Banco de Dados');
    client.release();
  })
  .catch(err => {
    console.error('❌ Erro ao ligar ao PostgreSQL:', err.message);
  });

export default pool;