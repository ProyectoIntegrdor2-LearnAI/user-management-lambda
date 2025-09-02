import { HOSTDB, USERDB, PASSDB, DATABASE, PORTDB } from '../config.js';
import pkg from 'pg';


const { Pool } = pkg;

const pool = new Pool({
    host: HOSTDB,
    port: Number(PORTDB),
    user: USERDB,
    password: PASSDB,
    database: DATABASE,
    
});

pool.on('connect', () => {
  console.log('Conectado a la base de datos PostgreSQL');
});

export default pool;
