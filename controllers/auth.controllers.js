import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { validationResult } from "express-validator";
import User from "../models/user.js";

// Generate random token for email verification
const generateEmailToken = () => crypto.randomBytes(32).toString("hex");

// Generate JWT for login
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// =================== SIGNUP ===================
export const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = generateEmailToken();

    await User.create({
      username,
      email,
      password: hashedPassword,
      emailVerificationToken: verifyToken,
      emailVerificationExpires: Date.now() + 30 * 60 * 1000,
    });

    // TODO: Send verifyToken via email instead of exposing in response
    res.status(201).json({
      message: "Signup successful. Verify your email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== LOGIN ===================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== VERIFY EMAIL ===================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== RESEND VERIFICATION ===================
export const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = generateEmailToken();

    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    // TODO: Send token via email
    res.json({ message: "Verification email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== UPDATE USER ===================
export const updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existing)
        return res.status(409).json({ message: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, email },
      { new: true, runValidators: true },
    );

    res.json({ message: "User updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== CHANGE PASSWORD ===================
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password required" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match)
      return res.status(401).json({ message: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== GET PROFILE ===================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== DELETE USER ===================
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
