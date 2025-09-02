import { Router } from "express";
import authController from "../controller/auth.controller.js";

const router = Router()

// router.get('/api/users/register', AuthController.register);
// router.get('/api/users/login', AuthController.login);
router.post("/api/users/register", authController.register);
router.post("/api/users/login", authController.login);

export default router;