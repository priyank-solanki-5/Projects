import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import Combos from "./pages/Combos";
import Reports from "./pages/Reports";
import DeadStock from "./pages/DeadStock";
import CustomerData from "./pages/CustomerData";
import Users from "./pages/Users";
import AddBook from "./pages/AddBook";
import AddCategory from "./pages/AddCategory";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-12 gap-6">
          <Sidebar />
          <main className="col-span-12 md:col-span-9 lg:col-span-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/books" element={<Books />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/combos" element={<Combos />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/dead-stock" element={<DeadStock />} />
              <Route path="/customers" element={<CustomerData />} />
              <Route path="/users" element={<Users />} />
              <Route path="/add-book" element={<AddBook />} />
              <Route path="/add-category" element={<AddCategory />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
