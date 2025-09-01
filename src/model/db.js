import { HOSTDB, USERDB, PASSDB, DATABASE, PORTDB } from '../config.js';
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    host: HOSTDB,
    user: USERDB,
    password: PASSDB,
    database: DATABASE,
    port: Number(PORTDB) 
});
