import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import booksRoutes from "./routes/books.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import combosRoutes from "./routes/combos.routes.js";
import customersRoutes from "./routes/customers.routes.js";
import authRoutes from "./routes/auth.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// Build allowed origins list. Support a comma-separated env var FRONTEND_URLS
// or a single FRONTEND_URL. In non-production also allow common localhost ports
// used by Vite or React dev servers.
const rawOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "";
const normalize = (u) => (u ? u.replace(/\/+$/, "").toLowerCase() : u);
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => normalize(s.trim()))
  .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  // default Vite dev server ports
  const devOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];
  devOrigins.forEach((o) => {
    if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
  });
}

console.log("CORS allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      const normalizedOrigin = normalize(origin);
      if (allowedOrigins.indexOf(normalizedOrigin) !== -1) {
        return callback(null, true);
      }
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    credentials: true,
  })
);
// Ensure preflight requests are handled and CORS headers are returned
app.options("*", cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/combos", combosRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/admin", adminRoutes);

const start = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI not set in .env");
    await mongoose.connect(uri, { dbName: "BookManagement" });
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
