const express = require("express");
const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post("/", (req, res) => {
  res.json({ message: "Create order" });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get("/:id", (req, res) => {
  res.json({ message: `Get order ${req.params.id}` });
});

module.exports = router;
