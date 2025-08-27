// IP-backend/controllers/parser.controller.js
const fs = require("fs/promises");
const { parseTTLService } = require("../services/parser.service");

async function parseTTLController(req, res) {
  const tmpPath = req.file?.path;
  try {
    if (!tmpPath) return res.status(400).send("Aucun fichier .ttl");
    const parsed = await parseTTLService(tmpPath);
    res.json(parsed);
  } catch (e) {
    const status = e.code === "PARSER_MCO" ? 400 : 500;
    res.status(status).send(e.message || "Parsing failed");
  } finally {
    if (tmpPath) { try { await fs.unlink(tmpPath); } catch {} }
  }
}
module.exports = { parseTTLController };
