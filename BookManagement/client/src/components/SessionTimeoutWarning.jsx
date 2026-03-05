import React from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Session Timeout Warning Component
 * Shows a warning modal when session is about to expire
 */
const SessionTimeoutWarning = () => {
  const { sessionTimeoutWarning, setSessionTimeoutWarning, logout } = useAuth();

  const handleExtendSession = () => {
    setSessionTimeoutWarning(false);
    // Reset activity timestamp by triggering a fake activity
    const event = new Event('mousedown');
    document.dispatchEvent(event);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!sessionTimeoutWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Session Timeout Warning
          </h2>
          <p className="text-gray-600 mb-6">
            Your session will expire in 5 minutes due to inactivity. 
            Click "Stay Logged In" to continue or "Logout" to end your session.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={handleExtendSession}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
