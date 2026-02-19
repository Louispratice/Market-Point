import express from "express";
import { body } from "express-validator";
import * as authController from "../controllers/auth.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";
import { asyncWrapper } from "../middlewares/error.middleware.js";

const router = express.Router();

router.post(
  "/signup",
  [
    body("username").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  asyncWrapper(authController.signup)
);

router.post("/login", asyncWrapper(authController.login));

router.post("/verify-email", asyncWrapper(authController.verifyEmail));

router.post(
  "/resend-verification",
  protect,
  asyncWrapper(authController.resendVerification)
);

router.put(
  "/update",
  protect,
  asyncWrapper(authController.updateUser)
);

router.post(
  "/change-password",
  protect,
  asyncWrapper(authController.changePassword)
);

router.delete(
  "/delete",
  protect,
  asyncWrapper(authController.deleteUser)
);

router.get("/profile", protect, asyncWrapper(authController.getProfile));

export default router;