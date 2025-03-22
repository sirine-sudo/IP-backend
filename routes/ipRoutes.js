const express = require("express");
const { createIPController, getAllIPsController, getIPByIdController } = require("../controllers/ipController");
const { authMiddleware,protect } = require("../middleware/authMiddleware");
 

const router = express.Router();

router.post("/", authMiddleware, createIPController); // Protected: Only authenticated users can create an IP
router.get("/", getAllIPsController); // Public: Anyone can see IPs
router.get("/:id", getIPByIdController); // Public: Anyone can see an IP by ID

module.exports = router;
