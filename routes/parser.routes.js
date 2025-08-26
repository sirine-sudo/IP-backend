const path = require("path");
const express = require("express");
const multer = require("multer");
const { parseTTLController } = require("../controllers/parser.controller");

const router = express.Router();
const upload = multer({ dest: path.resolve(__dirname, "../uploads") });

router.post("/parse", upload.single("ttl"), parseTTLController);

module.exports = router;
