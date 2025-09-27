/**
 * Database Connection - Infrastructure Layer
 * Configuración de conexión a PostgreSQL
 */

import fs from 'fs';
import { Pool } from 'pg';

const caPath = process.env.DB_CA_PATH;
let ssl;

if (caPath && fs.existsSync(caPath)) {
  ssl = {
    ca: fs.readFileSync(caPath, 'utf8'),
    rejectUnauthorized: true
  };
} else if (process.env.DB_SSL === 'true') {
  // Fallback para entornos locales sin CA configurada
  ssl = { rejectUnauthorized: false };
}

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ Conectado a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en conexión a base de datos:', err);
});

export default pool;