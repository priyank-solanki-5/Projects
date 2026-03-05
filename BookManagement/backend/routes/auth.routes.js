import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile
} from "../controller/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

// Public routes (no authentication required)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (authentication required)
router.get("/me", authenticateToken, getCurrentUser);
router.put("/profile", authenticateToken, updateProfile);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication service is running",
    timestamp: new Date().toISOString()
  });
});

export default router;
