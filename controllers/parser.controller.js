const { parseTTLService } = require("../services/parser.service");

async function parseTTLController(req, res) {
  try {
    if (!req.file) return res.status(400).send("Aucun fichier .ttl");
    const parsed = await parseTTLService(req.file.path);
    res.json(parsed);
  } catch (e) {
    console.error("Parse error:", e);
    res.status(500).send(e.message || "Parsing failed");
  }
}
module.exports = { parseTTLController };
