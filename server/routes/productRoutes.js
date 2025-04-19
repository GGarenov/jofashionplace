const express = require("express");
const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get("/", (req, res) => {
  res.json({ message: "Fetch all products" });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get("/:id", (req, res) => {
  res.json({ message: `Fetch product ${req.params.id}` });
});

module.exports = router;
