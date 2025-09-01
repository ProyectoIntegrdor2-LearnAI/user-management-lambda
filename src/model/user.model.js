import { pool } from "./db";

export default class UserModel {

    static async register(name, id, address, email, phone, password, typeUser) {
        try {
            const insertUsuario = `
            INSERT INTO usuario (name, id, address, email, phone, password, typeUser) 
            VALUES (?, ?, ?, ?, ?, ?, ?);
            `;
            const result = await pool.query(insertUsuario, [name, id, address, email, phone, password, typeUser]);
            return true;
        } catch (error) {
            console.error('registerModel error: ', error);
        }
    }

    static async isRegisterIndentify(id) {
        try {
            const rows = await pool.query(
                'SELECT COUNT(*) AS count FROM usuario WHERE id = ?',
                [id]
            );
            const exist = rows[0];
            if (exist.count > 0) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('isRegisterIndentify error:', error);
        }
    }
    static async isRegisterEmail(email) {
        try {
            const rows = await pool.query(
                'SELECT COUNT(*) AS count FROM usuario WHERE mail = ?',
                [email]
            );
            const exist = rows[0];
            if (exist.count > 0) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('isRegisterEmail error:', error);
        }
    }
    
    static async login(email, password) {
        try {
            const selectUsuario = `
            SELECT * FROM usuario WHERE mail = ? AND password = ?;
            `;
            const [rows] = await pool.query(selectUsuario, [email, password]);
            return rows;
        } catch (error) {
            console.error('loginModel error: ', error);
        }
    }

    static async getPass(correo) {
        try {
            const [pass] = await pool.query(
                'SELECT contraseña FROM usuario WHERE correo = ?',
                [correo]
            );
            return pass;
        } catch (error) {
            console.error('getPass error: ', error);
        }
    }
    static async getId(correo) {
        try {
            const [id] = await pool.query(
                'SELECT idusuario FROM usuario WHERE correo = ?',
                [correo]
            );
            return id;
        } catch (error) {
            console.error('getId error: ', error);
        }
    }

}
    