
import pool from './db.js';

export default class UserModel {

    static async register(name, id, address, email, phone, password, typeUser) {
        try {
            const insertUsuario = `
            INSERT INTO usuario (name, id, address, email, phone, password, typeUser) 
            VALUES ($1, $2, $3, $4, $5, $6, $7);            
            `;
            const result = await pool.query(insertUsuario, [name, id, address, email, phone, password, typeUser]);
            return result.rowCount > 0; 
        } catch (error) {
            console.error('registerModel error: ', error);
            return false;
        }
    }

    static async isRegisterIndentify(id) {
        try {
            const { rows } = await pool.query(
                'SELECT COUNT(*) AS count FROM usuario WHERE id = $1',
                [id]
            );
            if (rows && rows.length > 0 && parseInt(rows[0].count) > 0) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('isRegisterIndentify error:', error);
            throw error;
        }
    }
    static async isRegisterEmail(email) {
        try {
            const { rows } = await pool.query(
                'SELECT COUNT(*) AS count FROM usuario WHERE email = $1',
                [email]
            );
            if (rows && rows.length > 0 && parseInt(rows[0].count) > 0) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('isRegisterEmail error:', error);
            throw error;
        }
    }
    
    static async login(email) {
        try {
            const selectUsuario = `
            SELECT * FROM usuario WHERE email = $1; 
            `;
            const [rows] = await pool.query(selectUsuario, [email]);
            return rows[0]; 
        } catch (error) {
            console.error('loginModel error: ', error);
            throw error;
        }
    }

    static async getPass(email) { 
        try {
            const pass = await pool.query(
                'SELECT password FROM usuario WHERE email = $1', 
                [email] 
            );
            return pass.rows[0];
        } catch (error) {
            console.error('getPass error: ', error);

        }
    }
    static async getId(email) {
        try {
            const [rows] = await pool.query(
                'SELECT id FROM usuario WHERE email = $1',
                [email]
            );
            return rows[0];
        } catch (error) {
            console.error('getId error: ', error);
            throw error;
        }
    }
}


