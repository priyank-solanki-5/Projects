import express from "express";
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
} from "../controller/admin.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Admin Management Routes
 * All routes require authentication and admin role
 */

// Get all admins
router.get("/list", authenticateToken, getAllAdmins);

// Get admin by ID
router.get("/:id", authenticateToken, getAdminById);

// Create new admin
router.post("/create-admin", authenticateToken, createAdmin);

// Update admin
router.put("/:id", authenticateToken, updateAdmin);

// Delete admin (soft delete)
router.delete("/:id", authenticateToken, deleteAdmin);

export default router;

