const express = require("express");
const router = express.Router();

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post("/login", (req, res) => {
  res.json({ message: "User login" });
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
router.post("/", (req, res) => {
  res.json({ message: "Register user" });
});

module.exports = router;
