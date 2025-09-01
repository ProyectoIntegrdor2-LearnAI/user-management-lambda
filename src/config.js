import { config } from "dotenv";
config();

export const PORT = process.env.PORT;
export const HOSTNAME = process.env.HOST;

export const JWT_SECRET = process.env.JWT_SECRET;