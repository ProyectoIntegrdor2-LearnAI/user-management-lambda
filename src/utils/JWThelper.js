import { JWT_SECRET } from "../config.js";
import jwt from "jsonwebtoken";

export class JwtHelper {

    static async generateKey(correo) {
        try {
            const token = jwt.sign({ correo }, JWT_SECRET, {
                expiresIn: '1h',
            });
            return token;
        } catch (error) {
            console.error('generateKey error: ', error);
        }
    }

    static async verifyKey(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded;
        } catch (error) {
            console.error('verifyKey error: ', error);
            return null;
        }
    }

}