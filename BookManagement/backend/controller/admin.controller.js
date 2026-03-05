import User from "../models/user.models.js";

/**
 * Create Admin Controller
 * Creates a new admin user
 * Only authenticated admins can create other admins
 */
export const createAdmin = async (req, res) => {
  try {
    const { name, email, mobile, password, role = "admin" } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        requiredFields: ["name", "email", "mobile", "password"]
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits"
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Split name into firstName and lastName
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Create new admin user
    const newAdmin = new User({
      firstName,
      lastName,
      email,
      password,
      phone: mobile,
      role: "admin", // Always set role to admin
      isActive: true
    });

    // Save admin to database
    const savedAdmin = await newAdmin.save();

    // Return success response (exclude password)
    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        admin: {
          id: savedAdmin._id,
          name: savedAdmin.getFullName(),
          firstName: savedAdmin.firstName,
          lastName: savedAdmin.lastName,
          email: savedAdmin.email,
          mobile: savedAdmin.phone,
          role: savedAdmin.role,
          isActive: savedAdmin.isActive
        }
      }
    });

  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create admin",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * Get All Admins Controller
 * Returns list of all admin users
 * Only authenticated admins can access this
 */
export const getAllAdmins = async (req, res) => {
  try {
    // Find all admin users
    const admins = await User.find({ role: "admin" })
      .select("-password -__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Admins retrieved successfully",
      count: admins.length,
      data: admins
    });

  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admins",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * Get Admin By ID Controller
 * Returns a specific admin user
 */
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id).select("-password -__v");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Verify this is an admin
    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "This user is not an admin"
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin retrieved successfully",
      data: admin
    });

  } catch (error) {
    console.error("Get admin by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * Update Admin Controller
 * Updates an existing admin user
 */
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, role, isActive } = req.body;

    const admin = await User.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Update admin fields
    if (name) {
      const nameParts = name.trim().split(" ");
      admin.firstName = nameParts[0] || admin.firstName;
      admin.lastName = nameParts.slice(1).join(" ") || admin.lastName;
    }

    if (email && email !== admin.email) {
      // Check if new email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(409).json({
          success: false,
          message: "Email already in use by another user"
        });
      }
      admin.email = email;
    }

    if (mobile) {
      admin.phone = mobile;
    }

    if (role) {
      admin.role = role;
    }

    if (typeof isActive !== "undefined") {
      admin.isActive = isActive;
    }

    const updatedAdmin = await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: {
        admin: {
          id: updatedAdmin._id,
          name: updatedAdmin.getFullName(),
          email: updatedAdmin.email,
          mobile: updatedAdmin.phone,
          role: updatedAdmin.role,
          isActive: updatedAdmin.isActive
        }
      }
    });

  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * Delete Admin Controller
 * Soft deletes an admin user
 */
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Soft delete by deactivating
    admin.isActive = false;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin deactivated successfully"
    });

  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete admin",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

