import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

/**
 * Generate JWT token for user authentication
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
  
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * User Registration Controller
 * Creates a new user account with validation
 * Admin key required for admin role: admin@12345
 */
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role = "employee", adminKey } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        requiredFields: ["firstName", "lastName", "email", "password", "phone"]
      });
    }

    // Validate role
    if (!["employee", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Only 'employee' or 'admin' roles are allowed"
      });
    }

    // Validate admin key if role is admin
    if (role === "admin") {
      const ADMIN_KEY = "admin@12345";
      
      if (!adminKey) {
        return res.status(400).json({
          success: false,
          message: "Admin key is required to create an admin account"
        });
      }

      if (adminKey !== ADMIN_KEY) {
        return res.status(403).json({
          success: false,
          message: "Invalid admin key. Only authorized admins can create admin accounts."
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      role
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Generate JWT token
    const token = generateToken(savedUser._id, savedUser.role);

    // Return success response (exclude password)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          fullName: savedUser.getFullName(),
          email: savedUser.email,
          phone: savedUser.phone,
          role: savedUser.role,
          isActive: savedUser.isActive
        },
        token
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * User Login Controller
 * Authenticates user and returns JWT token
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email and include password for comparison
    const user = await User.findByEmail(email).select("+password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator"
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * Get Current User Profile
 * Returns authenticated user's information
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * Update User Profile
 * Allows users to update their profile information
 */
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const userId = req.user.userId;

    // Build update object with only provided fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          fullName: updatedUser.getFullName(),
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          isActive: updatedUser.isActive
        }
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during profile update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
