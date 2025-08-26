// routes/parserRoutes.js
"use strict";

/**
 * Routes d’API pour parser uniquement les fichiers TTL → MCO
 */

const express = require("express");
const multer = require("multer");
const { parseTTLFile } = require("../services/parserService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Parser un fichier TTL ---
router.post("/parse", upload.single("ttl"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No TTL file uploaded." });
    }

    const ttlContent = req.file.buffer.toString("utf-8");
    const parsedData = parseTTLFile(ttlContent);

    return res.json(parsedData);
  } catch (error) {
    console.error("❌ Erreur parsing TTL:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

module.exports = router;
