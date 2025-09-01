import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./view/auth.routes.js";

const app = express();

app.use(morgan("dev"));

app.use(express.json());
app.use(cors());
app.use('/api/users/',authRoutes);

export default app;