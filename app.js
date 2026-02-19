import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import authRoutes from "./route/auth.route.js";
import productRoutes from "./route/productRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express(); // ✅ app must be initialized first

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));





const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Health check
app.get("/", (req, res) => res.send("Mini Jiji API is running 🚀"));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

export default app;