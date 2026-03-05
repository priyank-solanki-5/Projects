import { NavLink } from "react-router-dom";
import { useState } from "react";
import image from "../assets/images/logo.jpg";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen, onClose, onCollapseChange, autoCollapsed }) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  // Handle navigation click to close sidebar on mobile
  const handleNavClick = () => {
    // Close sidebar on mobile (when it's open and overlay is visible)
    if (isOpen && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        bg-black text-white ${
          isCollapsed 
            ? 'w-12 lg:w-12 xl:w-16 2xl:w-20' 
            : 'w-48 lg:w-48 xl:w-56 2xl:w-64'
        } min-h-screen flex flex-col p-2 lg:p-3 xl:p-4
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Toggle Button */}
      <button
        onClick={handleCollapseToggle}
        className={`hidden lg:block mb-2 p-1 text-white hover:text-green-400 transition-colors ${
          autoCollapsed ? 'bg-green-600 rounded' : ''
        }`}
        title={
          autoCollapsed 
            ? "Auto-collapsed due to content overflow - Click to expand" 
            : isCollapsed 
            ? "Expand sidebar" 
            : "Collapse sidebar"
        }
      >
        {isCollapsed ? "→" : "←"}
        {autoCollapsed && <span className="ml-1 text-xs">⚡</span>}
      </button>

      {/* User Info */}
      <div className={`flex flex-col items-center mb-2 ${isCollapsed ? 'hidden' : ''}`}>
        <img
          src={image}
          alt="user profile"
          className="w-16 h-16 rounded-full border-2 border-green-500"
        />
        <h3 className="mt-2 font-bold text-sm text-center px-2 truncate w-full">
          {user?.fullName || `${user?.firstName} ${user?.lastName}` || "User"}
        </h3>
        <span className="bg-green-500 text-black text-xs px-2 py-1 rounded-full">
          {user?.role || "User"}
        </span>
      </div>

      {/* Collapsed User Info */}
      {isCollapsed && (
        <div className="flex flex-col items-center mb-2">
          <img
            src={image}
            alt="user profile"
            className="w-8 h-8 rounded-full border-2 border-green-500"
            title={user?.fullName || `${user?.firstName} ${user?.lastName}` || "User"}
          />
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex flex-col space-y-0.5">
        <NavLink 
          to="/dashboard" 
          onClick={handleNavClick}
          className={({ isActive }) =>
            `px-2 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${
              isActive 
                ? "bg-green-500 text-black font-semibold shadow-lg" 
                : "text-white hover:text-green-400 hover:bg-gray-800"
            }`
          }
          title={isCollapsed ? "Dashboard" : ""}
        >
          <span className="text-lg">📊</span>
          {!isCollapsed && <span className="ml-2">Dashboard</span>}
        </NavLink>
        <NavLink 
          to="/inventory" 
          onClick={handleNavClick}
          className={({ isActive }) =>
            `px-2 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${
              isActive 
                ? "bg-green-500 text-black font-semibold shadow-lg" 
                : "text-white hover:text-green-400 hover:bg-gray-800"
            }`
          }
          title={isCollapsed ? "Inventory" : ""}
        >
          <span className="text-lg">📚</span>
          {!isCollapsed && <span className="ml-2">Inventory</span>}
        </NavLink>
        <NavLink 
          to="/books" 
          onClick={handleNavClick}
          className={({ isActive }) =>
            `px-2 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${
              isActive 
                ? "bg-green-500 text-black font-semibold shadow-lg" 
                : "text-white hover:text-green-400 hover:bg-gray-800"
            }`
          }
          title={isCollapsed ? "Books" : ""}
        >
          <span className="text-lg">📖</span>
          {!isCollapsed && <span className="ml-2">Books</span>}
        </NavLink>
        <NavLink 
          to="/combos" 
          onClick={handleNavClick}
          className={({ isActive }) =>
            `px-2 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${
              isActive 
                ? "bg-green-500 text-black font-semibold shadow-lg" 
                : "text-white hover:text-green-400 hover:bg-gray-800"
            }`
          }
          title={isCollapsed ? "Combos" : ""}
        >
          <span className="text-lg">🎁</span>
          {!isCollapsed && <span className="ml-2">Combos</span>}
        </NavLink>
        <NavLink 
          to="/cart" 
          onClick={handleNavClick}
          className={({ isActive }) =>
            `px-2 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${
              isActive 
                ? "bg-green-500 text-black font-semibold shadow-lg" 
                : "text-white hover:text-green-400 hover:bg-gray-800"
            }`
          }
          title={isCollapsed ? "Cart" : ""}
        >
          <span className="text-lg">🛒</span>
          {!isCollapsed && <span className="ml-2">Cart</span>}
        </NavLink>
        <NavLink 
          to="/orders" 
          onClick={handleNavClick}
          className={({ isActive }) =>
            `px-2 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${
              isActive 
                ? "bg-green-500 text-black font-semibold shadow-lg" 
                : "text-white hover:text-green-400 hover:bg-gray-800"
            }`
          }
          title={isCollapsed ? "Orders" : ""}
        >
          <span className="text-lg">📋</span>
          {!isCollapsed && <span className="ml-2">Orders</span>}
        </NavLink>
        <NavLink 
          to="/reports" 
          onClick={handleNavClick}
          className={({ isActive }) =>
            `px-2 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${
              isActive 
                ? "bg-green-500 text-black font-semibold shadow-lg" 
                : "text-white hover:text-green-400 hover:bg-gray-800"
            }`
          }
          title={isCollapsed ? "Reports" : ""}
        >
          <span className="text-lg">📈</span>
          {!isCollapsed && <span className="ml-2">Reports</span>}
        </NavLink>
        <NavLink 
          to="/customers" 
          onClick={handleNavClick}
          className={({ isActive }) =>
            `px-2 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${
              isActive 
                ? "bg-green-500 text-black font-semibold shadow-lg" 
                : "text-white hover:text-green-400 hover:bg-gray-800"
            }`
          }
          title={isCollapsed ? "Customers" : ""}
        >
          <span className="text-lg">👥</span>
          {!isCollapsed && <span className="ml-2">Customers</span>}
        </NavLink>
        <NavLink 
          to="/employees" 
          onClick={handleNavClick}
          className={({ isActive }) =>
            `px-2 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${
              isActive 
                ? "bg-green-500 text-black font-semibold shadow-lg" 
                : "text-white hover:text-green-400 hover:bg-gray-800"
            }`
          }
          title={isCollapsed ? "Employees" : ""}
        >
          <span className="text-lg">👨‍💼</span>
          {!isCollapsed && <span className="ml-2">Employees</span>}
        </NavLink>
        
        {/* Admin Management - Only visible to admins */}
        {user?.role === "admin" && (
          <NavLink 
            to="/admin-management" 
            onClick={handleNavClick}
            className={({ isActive }) =>
              `px-2 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${
                isActive 
                  ? "bg-green-500 text-black font-semibold shadow-lg" 
                  : "text-white hover:text-green-400 hover:bg-gray-800"
              }`
            }
            title={isCollapsed ? "Admin Management" : ""}
          >
            <span className="text-lg">🔐</span>
            {!isCollapsed && <span className="ml-2">Admin Management</span>}
          </NavLink>
        )}
        
        <NavLink 
          to="/profile" 
          onClick={handleNavClick}
          className={({ isActive }) =>
            `px-2 py-2 rounded-lg transition-all duration-200 flex items-center text-sm ${
              isActive 
                ? "bg-green-500 text-black font-semibold shadow-lg" 
                : "text-white hover:text-green-400 hover:bg-gray-800"
            }`
          }
          title={isCollapsed ? "My Profile" : ""}
        >
          <span className="text-lg">👤</span>
          {!isCollapsed && <span className="ml-2">My Profile</span>}
        </NavLink>
      </nav>
      </div>
    </>
  );
}
export default Sidebar;