const express = require("express");
const { deployController } = require("../controllers/deploy.controller");

const router = express.Router();

// body: { spec: {...}, account?: "0x..." }
router.post("/deploy", deployController);

module.exports = router;
