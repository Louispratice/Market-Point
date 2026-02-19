import express from "express";
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import { protect } from "../middlewares/auth.middleware.js";
import { asyncWrapper } from "../middlewares/error.middleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", asyncWrapper(getAllProducts));
router.get("/:id", asyncWrapper(getProduct));

// Protected routes
router.post(
  "/",
  protect,
  upload.array("images", 5),
  asyncWrapper(createProduct),
);
router.put(
  "/:id",
  protect,
  upload.array("images", 5),
  asyncWrapper(updateProduct),
);
router.delete("/:id", protect, asyncWrapper(deleteProduct));

export default router;
