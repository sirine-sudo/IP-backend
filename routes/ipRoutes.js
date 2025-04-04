const express = require("express");
const multer = require("multer");
const path = require("path");
const { createIPController, getAllIPsController, getIPByIdController, updateTokenId } = require("../controllers/ipController");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();
const ipController = require("../controllers/ipController");
const { uploadMetadataJSON } = require("../controllers/ipfsController");

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


// Routes
router.post("/", authMiddleware, upload.single("file"), createIPController); // Now supports file upload
router.get("/", getAllIPsController);
router.get("/:id", getIPByIdController);
router.post("/ips", authMiddleware, upload.single("file"), createIPController);
router.put("/:id/update-token", ipController.updateTokenId); 
router.post("/metadata", uploadMetadataJSON);

module.exports = router;
