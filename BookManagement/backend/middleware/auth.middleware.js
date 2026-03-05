import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

/**
 * Authentication Middleware
 * Verifies JWT token and adds user information to request object
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    // Verify JWT token
    const JWT_SECRET =
      process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or token is invalid",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Add user information to request object
    req.user = {
      userId: user._id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      // Provide structured information so clients can detect an expired token
      // and optionally trigger a refresh or force re-login.
      res.setHeader(
        "X-Token-Expired-At",
        error.expiredAt?.toISOString?.() || ""
      );
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Access token has expired",
        expiredAt: error.expiredAt,
      });
    }

    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role to access the resource
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions",
          requiredRoles: allowedRoles,
          userRole: userRole,
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({
        success: false,
        message: "Authorization failed",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
};

/**
 * Optional Authentication Middleware
 * Similar to authenticateToken but doesn't require authentication
 * Useful for routes that work for both authenticated and non-authenticated users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    // Verify token if provided
    const JWT_SECRET =
      process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = {
        userId: user._id,
        role: user.role,
        email: user.email,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    req.user = null;
    next();
  }
};
