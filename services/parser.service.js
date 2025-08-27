// IP-backend/services/parser.service.js
const fs = require("fs/promises");
const path = require("path");

// === Parser officiel ISO ===
const { getContractFromMCO } = require(
  path.resolve(__dirname, "../../ISO IEC 21000-23/MPEG-21 MCO Parser/index.js")
);

async function parseTTLService(ttlFilePath) {
  const ttlText = await fs.readFile(ttlFilePath, "utf8");
  const parsed = await getContractFromMCO(ttlText);
  if (!parsed || typeof parsed !== "object") {
    const err = new Error("MCO parse error: empty result");
    err.code = "PARSER_MCO";
    throw err;
  }
  return parsed; // { contracts: [...] }
}

module.exports = { parseTTLService };
