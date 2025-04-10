const express = require("express");
const { 
  createIPController, 
  getAllIPsController, 
  getIPByIdController, 
  updateTokenId, 
  updateIPMetadata, 
  deleteIP, 
  updateSaleStatus, 
  getMyIPsController 
} = require("../controllers/ipController");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadMetadataJSON } = require("../controllers/ipfsController");

const router = express.Router();

// Routes
router.post("/", authMiddleware, upload.single("file"), createIPController); 
router.get("/", getAllIPsController);
router.get("/my-ips", authMiddleware, getMyIPsController);
router.get("/:id", getIPByIdController);
router.put("/:id/update-token", updateTokenId); 
router.put("/:id/update-metadata", updateIPMetadata); 
router.post("/metadata", uploadMetadataJSON);
router.delete("/:id", deleteIP);
router.put("/:id/sale", updateSaleStatus);

module.exports = router;
