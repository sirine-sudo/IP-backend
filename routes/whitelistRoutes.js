const express = require("express");
const router = express.Router();
const { whitelistUser, checkWhitelistStatus } = require("../controllers/whitelistController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Route pour ajouter à la whitelist
router.post("/add", protect, isAdmin, whitelistUser);

//  route pour vérifier si une adresse est whitelistée
router.get("/check", protect, checkWhitelistStatus);

module.exports = router;
