const { parseTextService } = require("../services/parseText.service");

async function parseTextController(req, res) {
  try {
    const { ttl } = req.body || {};
    if (!ttl || typeof ttl !== "string" || !ttl.trim()) {
      return res.status(400).send("Body 'ttl' string requis");
    }
    const parsed = await parseTextService(ttl);
    res.json(parsed);
  } catch (e) {
    const status = e.code === "PARSER_MCO" ? 400 : 500;
    res.status(status).send(e.message || "Parsing failed");
  }
}
module.exports = { parseTextController };
