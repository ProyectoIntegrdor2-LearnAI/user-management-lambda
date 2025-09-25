/**
 * Database Connection - Infrastructure Layer
 * Configuración de conexión a PostgreSQL
 */

import { config } from '../../shared/config.js';
import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
    host: config.database.host,
    port: Number(config.database.port),
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
});

pool.on('connect', () => {
  console.log('✅ Conectado a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en conexión a base de datos:', err);
});

export default pool;