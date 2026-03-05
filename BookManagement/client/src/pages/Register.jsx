import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Register Component
 * Handles new user registration with comprehensive form validation
 * Features: Form validation, error handling, loading states, role selection
 */
const Register = () => {
  // Navigation and authentication
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "employee",
    adminKey: "" // For admin key validation
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneFormatHint, setPhoneFormatHint] = useState("");
  
  // Admin key constant
  const ADMIN_KEY = "admin@12345";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Clear admin key when role changes
  useEffect(() => {
    if (formData.role !== "admin" && formData.adminKey) {
      setFormData(prev => ({ ...prev, adminKey: "" }));
    }
  }, [formData.role]);

  /**
   * Handle form input changes with special phone formatting
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === "phone") {
      // Allow only digits, +, and spaces
      const cleanedValue = value.replace(/[^\d+\s]/g, "");
      
      // Format phone number as user types
      let formattedValue = cleanedValue;
      
      // If user starts typing +91, allow it
      if (cleanedValue.startsWith("+91")) {
        // Remove extra spaces and ensure proper format
        formattedValue = cleanedValue.replace(/\s+/g, "");
        // Limit to +91 followed by max 10 digits
        if (formattedValue.length > 13) {
          formattedValue = formattedValue.substring(0, 13);
        }
      } else if (cleanedValue.startsWith("+")) {
        // If user types + but not +91, remove it
        formattedValue = cleanedValue.replace(/^\+/, "");
      } else {
        // For regular numbers, limit to 10 digits
        const digitsOnly = cleanedValue.replace(/\D/g, "");
        if (digitsOnly.length > 10) {
          formattedValue = digitsOnly.substring(0, 10);
        } else {
          formattedValue = digitsOnly;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      
      // Update phone format hint
      if (name === "phone") {
        if (formattedValue.startsWith("+91")) {
          setPhoneFormatHint("✅ Valid format: +91XXXXXXXXXX");
        } else if (formattedValue.length === 10 && /^\d{10}$/.test(formattedValue)) {
          setPhoneFormatHint("✅ Valid format: 10-digit number");
        } else if (formattedValue.length > 0) {
          setPhoneFormatHint("⚠️ Enter 10 digits or +91 followed by 10 digits");
        } else {
          setPhoneFormatHint("");
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  /**
   * Validate form data
   * @returns {boolean} True if valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation - supports both 10-digit and +91 format
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phone = formData.phone.trim();
      const digitsOnly = phone.replace(/\D/g, "");
      
      // Check for +91 format
      if (phone.startsWith("+91")) {
        if (phone.length !== 13 || !/^\+91\d{10}$/.test(phone)) {
          newErrors.phone = "Please enter a valid phone number in format +91XXXXXXXXXX (10 digits after +91)";
        }
      } 
      // Check for 10-digit format
      else if (digitsOnly.length === 10 && /^\d{10}$/.test(digitsOnly)) {
        // Valid 10-digit number
      } 
      // Invalid format
      else {
        newErrors.phone = "Please enter a valid 10-digit phone number or +91 followed by 10 digits";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Admin Key validation - only if role is admin
    if (formData.role === "admin") {
      if (!formData.adminKey) {
        newErrors.adminKey = "Admin key is required to create an admin account";
      } else if (formData.adminKey !== ADMIN_KEY) {
        newErrors.adminKey = "Invalid admin key. Only authorized admins can create admin accounts.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validate admin key if role is admin
      if (formData.role === "admin" && formData.adminKey !== ADMIN_KEY) {
        setErrors({ general: "Invalid admin key. Only authorized admins can create admin accounts." });
        setIsSubmitting(false);
        return;
      }

      // Prepare registration data
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.startsWith("+91") 
          ? formData.phone.substring(3) // Remove +91 prefix
          : formData.phone.replace(/\D/g, ""), // Remove non-digits for 10-digit format
        role: formData.role
      };

      // Include admin key in request if role is admin
      if (formData.role === "admin") {
        registrationData.adminKey = formData.adminKey;
      }

      const result = await register(registrationData);
      
      if (result.success) {
        // Success - redirect will happen automatically via useEffect
        console.log("Registration successful:", result.message);
      } else {
        // Show error message
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img 
            src="/logo.jpg" 
            alt="Book Management Logo" 
            className="mx-auto h-16 w-16 rounded-full"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our book management system
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.firstName ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.lastName ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.phone ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                placeholder="9876543210 or +919876543210"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter 10-digit number (9876543210) or with country code (+919876543210)
              </p>
              {phoneFormatHint && (
                <p className={`mt-1 text-xs ${
                  phoneFormatHint.startsWith("✅") ? "text-green-600" : 
                  phoneFormatHint.startsWith("⚠️") ? "text-yellow-600" : "text-gray-500"
                }`}>
                  {phoneFormatHint}
                </p>
              )}
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Admin Key Field - Only shown when Admin role is selected */}
            {formData.role === "admin" && (
              <div>
                <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700">
                  Admin Key <span className="text-red-500">*</span>
                </label>
                <input
                  id="adminKey"
                  name="adminKey"
                  type="password"
                  required={formData.role === "admin"}
                  value={formData.adminKey}
                  onChange={handleInputChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.adminKey ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                  placeholder="Enter admin key to create admin account"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Admin key is required to create an admin account. Contact system administrator for the key.
                </p>
                {errors.adminKey && (
                  <p className="mt-1 text-sm text-red-600">{errors.adminKey}</p>
                )}
              </div>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="text-gray-400 hover:text-gray-600">
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                    errors.confirmPassword ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
