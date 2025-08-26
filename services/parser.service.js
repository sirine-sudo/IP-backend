// IP-backend/services/parser.service.js
const path = require("path");
const fs = require("fs/promises");

// ⚠️ adapte le chemin vers TON parser MCO
const { getContractFromMCO } = require(
  path.resolve(__dirname, "../../ISO IEC 21000-23/MPEG-21 MCO Parser/index.js")
);

async function parseTTLService(ttlFilePath) {
  // 1) Lire le contenu du .ttl
  const ttlText = await fs.readFile(ttlFilePath, "utf8");

  // 2) Parser le CONTENU (pas le chemin)
  const parsed = await getContractFromMCO(ttlText);

  return parsed;
}

module.exports = { parseTTLService };
