import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.models.js";

dotenv.config();

/**
 * Seed script to create initial admin user
 * Admin account credentials:
 * - Email: admin@example.com
 * - Password: admin123
 * - Admin Key: admin@12345
 */

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI not set in .env");
    }

    await mongoose.connect(uri, { dbName: "BookManagement" });
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    
    if (existingAdmin) {
      console.log("Admin user already exists, skipping seed...");
      await mongoose.connection.close();
      return;
    }

    // Create initial admin user
    const admin = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: "admin123", // Will be hashed by User model
      phone: "9876543210",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await admin.save();
    console.log("✅ Initial admin user created successfully!");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");
    console.log("   Admin Key: admin@12345");

    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);

  } catch (error) {
    console.error("Error seeding admin:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed script
seedAdmin();

