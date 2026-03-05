import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.jpg";
import { useContext } from "react";
import { CartContext } from "../store/cartContextValue";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart = [] } = useContext(CartContext) || {};
  const cartItemCount = (cart || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleCartNavigate = () => {
    navigate("/cart");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center bg-white shadow px-4 lg:px-6 py-3">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex items-center space-x-2 lg:space-x-3">
        <img src={logo} alt="logo" className="h-8 lg:h-10" />
        <h1 className="text-green-600 font-bold text-lg lg:text-xl">Buy School Book</h1>
      </div>
      
      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* User Info - Hidden on small screens */}
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-gray-700 font-medium text-sm lg:text-base">
            Welcome, {user?.firstName || "User"}
          </span>
          <span className="text-white px-2 lg:px-3 py-1 rounded-full bg-green-600 text-xs lg:text-sm">
            {user?.role || "User"}
          </span>
        </div>

        {/* Cart Icon */}
        <div id="nav-cart-icon" className="relative cursor-pointer">
          <span className="text-2xl" onClick={handleCartNavigate}>🛒</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1 rounded-full">
              {cartItemCount}
            </span>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn-danger px-2 lg:px-3 py-1"
        >
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">🚪</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
