const express = require("express");
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
router.post("/", registerUser);

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post("/login", authUser);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", protect, getUserProfile);

module.exports = router;
