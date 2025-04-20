const express = require("express");
const multer = require("multer");
const path = require("path");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files to the uploads directory
  },
  filename: function (req, file, cb) {
    // Create unique filename: fieldname-timestamp-extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  // Accept image files only
  const filetypes = /jpe?g|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Images only! Please upload a JPG, PNG, or WebP file."));
  }
};

// Setup multer upload with configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB max file size
  fileFilter: fileFilter,
});

// @desc    Upload image
// @route   POST /api/upload
// @access  Private/Admin
router.post("/", protect, admin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Return the file path that can be stored in the product
  res.send(`/uploads/${req.file.filename}`);
});

module.exports = router;
