import { config } from "dotenv";
config();


export const PORT = process.env.PORT || 3000;
export const HOSTNAME = process.env.HOSTNAME || 'localhost';
export const JWT_SECRET = process.env.JWT_SECRET;



export const HOSTDB = process.env.DB_HOST;
export const PORTDB = process.env.DB_PORT;
export const USERDB = process.env.DB_USER;
export const PASSDB = process.env.DB_PASSWORD;
export const DATABASE = process.env.DB_NAME;


