
import { Router } from "express";
import ProfileController from "../controller/profile.controller.js";
import { authenticateToken } from "../utils/authMiddleware.js";

const router = Router();

// All profile routes should be protected
router.use(authenticateToken);

// MVP Routes - Simple profile management
router.get("/api/profile", ProfileController.getOwnProfile);
router.put("/api/profile", ProfileController.updateOwnProfile);

export default router;
