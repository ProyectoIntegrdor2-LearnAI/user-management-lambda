/**
 * Database Connection - Infrastructure Layer
 * Configuración de conexión a PostgreSQL
 */

import { config } from '../config/index.js';
import pkg from 'pg';

const { Pool } = pkg;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      // ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host: config.database.host,
      port: Number(config.database.port),
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : undefined,
      max: config.database.maxConnections,
      idleTimeoutMillis: config.database.idleTimeoutMillis,
      connectionTimeoutMillis: config.database.connectionTimeoutMillis
    });

pool.on('connect', () => {
  console.log('✅ Conectado a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en conexión a base de datos:', err);
});

export default pool;