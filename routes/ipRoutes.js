const express = require("express");
const multer = require("multer");
const path = require("path");
const { createIPController, getAllIPsController, getIPByIdController } = require("../controllers/ipController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.post("/", authMiddleware, upload.single("file"), createIPController); // Now supports file upload
router.get("/", getAllIPsController);
router.get("/:id", getIPByIdController);

module.exports = router;
