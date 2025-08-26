const { normalizeSpec } = require("../services/normalizeSpec");
const { deployOnEthereum } = require("../services/deploy.service");

async function deployController(req, res) {
  try {
    const { spec, account } = req.body || {};
    if (!spec) return res.status(400).send("spec manquant");
    const normalized = normalizeSpec(spec, account);
    const out = await deployOnEthereum(normalized);
    res.json(out);
  } catch (e) {
    console.error("Deploy error:", e);
    res.status(500).send(e.message || "Deployment failed");
  }
}
module.exports = { deployController };
