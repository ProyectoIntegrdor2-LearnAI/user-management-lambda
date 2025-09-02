import { JWT_SECRET } from "../config.js";
import jwt from "jsonwebtoken";

export class JwtHelper {

    static generateKey(email) {
        try {
            const token = jwt.sign(
                {email}, 
                JWT_SECRET, 
                {expiresIn: '1h',}
            );
            return token;
        } catch (error) {
            console.error('generateKey error: ', error);
        }
    }

    static verifyKey(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded;
        } catch (error) {
            console.error('verifyKey error: ', error);
            return null;
        }
    }

    // static isTokenExpired(token) {
    //     try {
    //         const decoded = jwt.decode(token);
    //         if (!decoded || !decoded.exp) return true;
    //         const now = Math.floor(Date.now() / 1000);
    //         return decoded.exp < now;
    //     } catch (error) {
    //         console.error('isTokenExpired error: ', error);
    //         return true;
    //     }
    // }
    
}