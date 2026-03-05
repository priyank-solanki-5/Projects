import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */
const AuthContext = createContext();

/**
 * Custom hook to use authentication context
 * @returns {Object} Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Authentication Provider Component
 * Wraps the app and provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false);

  // API base URL
  const API_BASE_URL = `https://bookstore-c1tt.onrender.com/api/auth`;

  // Set up axios interceptors for automatic token attachment and 401 handling
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Response interceptor to handle 401 errors globally
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, logout user
          console.warn("Authentication failed, logging out user");
          // Clear stored data
          localStorage.removeItem("authToken");
          delete axios.defaults.headers.common["Authorization"];

          // Reset state
          setUser(null);
          setIsAuthenticated(false);

          // Redirect to login if not already there
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Periodic authentication check every 5 minutes
  useEffect(() => {
    if (isAuthenticated) {
      const authCheckInterval = setInterval(() => {
        checkAuthStatus();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(authCheckInterval);
    }
  }, [isAuthenticated]);

  // Session timeout and activity tracking
  useEffect(() => {
    if (!isAuthenticated) return;

    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

    // Update last activity on user interaction
    const updateActivity = () => {
      setLastActivity(Date.now());
      setSessionTimeoutWarning(false);
    };

    // Add event listeners for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Session timeout checker
    const sessionChecker = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilTimeout = SESSION_TIMEOUT - timeSinceActivity;

      if (timeUntilTimeout <= 0) {
        // Session timeout - logout user
        console.warn("Session timeout - logging out user");
        logout();
        window.location.href = "/login";
      } else if (timeUntilTimeout <= WARNING_TIME && !sessionTimeoutWarning) {
        // Show warning
        setSessionTimeoutWarning(true);
      }
    }, 60000); // Check every minute

    // Cleanup
    return () => {
      clearInterval(sessionChecker);
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isAuthenticated, lastActivity, sessionTimeoutWarning]);

  /**
   * Check authentication status by validating stored token
   */
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Set token in axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Verify token with backend
      const response = await axios.get(`${API_BASE_URL}/me`);

      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      } else {
        // Invalid token, clear it
        localStorage.removeItem("authToken");
        delete axios.defaults.headers.common["Authorization"];
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid token
      localStorage.removeItem("authToken");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * User login function
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  const login = async (email, password) => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { user: userData, token } = response.data.data;

        // Store token and user data
        localStorage.setItem("authToken", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(userData);
        setIsAuthenticated(true);

        return {
          success: true,
          message: response.data.message,
          user: userData,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * User registration function
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = async (userData) => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${API_BASE_URL}/register`, userData);

      if (response.data.success) {
        const { user: newUser, token } = response.data.data;

        // Store token and user data
        localStorage.setItem("authToken", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(newUser);
        setIsAuthenticated(true);

        return {
          success: true,
          message: response.data.message,
          user: newUser,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * User logout function
   */
  const logout = () => {
    // Clear stored data
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common["Authorization"];

    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Update result
   */
  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);

      const response = await axios.put(`${API_BASE_URL}/profile`, profileData);

      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);

        return {
          success: true,
          message: response.data.message,
          user: updatedUser,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Profile update failed",
        };
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Profile update failed. Please try again.";

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    sessionTimeoutWarning,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
    setSessionTimeoutWarning,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
