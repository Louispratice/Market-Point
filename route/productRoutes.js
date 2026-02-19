import express from "express";
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router(); // ✅ Declare first

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProduct);

// Protected routes
router.post("/", protect, upload.array("images", 5), createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;