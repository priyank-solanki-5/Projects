import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import useOverflowDetection from "./hooks/useOverflowDetection";
import useFoldableScreen from "./hooks/useFoldableScreen";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Books from "./pages/Books";
import Combos from "./pages/Combos";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";
import Employees from "./pages/Employees";
import Profile from "./pages/Profile";
import AddBook from "./pages/AddBook";
import AddCombo from "./pages/AddCombo";
import Checkout from "./pages/Checkout";
import CartProvider from "./store/CartContext";
import { AuthProvider } from "./context/AuthContext";
import SessionTimeoutWarning from "./components/SessionTimeoutWarning";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <CartProvider>
                  <AppLayout />
                  <SessionTimeoutWarning />
                </CartProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Layout component for authenticated users
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  const location = useLocation();

  // Detect overflow in the main content area
  const { isOverflowing, ref: contentRef } = useOverflowDetection({
    threshold: 30,
    enabled: true
  });

  // Detect foldable screen state
  const foldableState = useFoldableScreen();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
    // Reset auto-collapse state when manually toggled
    if (!collapsed) {
      setAutoCollapsed(false);
    }
  };

  // Auto-collapse sidebar when content overflows
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    const isUltraWide = window.innerWidth >= 1920;
    const isFoldable = window.innerWidth >= 768 && window.innerWidth <= 1536;
    
    if (isOverflowing && !sidebarCollapsed && isDesktop) {
      setSidebarCollapsed(true);
      setAutoCollapsed(true);
    } else if (!isOverflowing && autoCollapsed && isDesktop) {
      // Auto-expand when overflow is resolved (with a small delay to prevent flickering)
      const timer = setTimeout(() => {
        setSidebarCollapsed(false);
        setAutoCollapsed(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // Special handling for ultra-wide screens (like fully unfolded ZenBook Fold)
    if (isUltraWide && !sidebarCollapsed) {
      // Keep sidebar expanded on ultra-wide screens for better UX
      setAutoCollapsed(false);
    }
    
    // Special handling for folded state
    if (foldableState.isFolded && !sidebarCollapsed) {
      // Auto-collapse when folded for better space utilization
      setSidebarCollapsed(true);
      setAutoCollapsed(true);
    }
  }, [isOverflowing, sidebarCollapsed, autoCollapsed, foldableState.isFolded]);

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  return (
    <div className="flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        onCollapseChange={handleCollapseChange}
        autoCollapsed={autoCollapsed}
      />
      <div className={`flex flex-col w-full transition-all duration-300 ${
        sidebarCollapsed 
          ? 'lg:ml-12 xl:ml-16 2xl:ml-20' 
          : 'lg:ml-48 xl:ml-56 2xl:ml-64'
      }`}>
        <Navbar onMenuClick={toggleSidebar} />
        <div 
          ref={contentRef}
          className="flex-1 bg-gray-50 min-h-screen p-2 sm:p-3 lg:p-4 xl:p-6 2xl:p-8 overflow-x-hidden"
        >
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/books" element={<Books />} />
            <Route path="/combos" element={<Combos />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/add-book" element={<AddBook />} />
            <Route path="/add-combo" element={<AddCombo />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
