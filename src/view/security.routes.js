
import { Router } from "express";
import SecurityController from "../controller/security.controller.js";
import { authenticateToken } from "../utils/authMiddleware.js";

const router = Router();

// All security routes are protected
router.use(authenticateToken);

// MVP Security Routes - Simplified
router.post("/api/security/change-password", SecurityController.changePassword);
router.get("/api/security/sessions", SecurityController.getActiveSessions);
router.delete("/api/security/sessions/:session_id", SecurityController.terminateSession);
router.delete("/api/security/sessions", SecurityController.terminateAllSessions);

export default router;
