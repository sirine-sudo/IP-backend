const path = require("path");
const { getContractFromMCO } = require(
  path.resolve(__dirname, "../../ISO IEC 21000-23/MPEG-21 MCO Parser/index.js")
);

async function parseTextService(ttlText) {
  try {
    const parsed = await getContractFromMCO(ttlText);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Parser returned empty result");
    }
    return parsed;
  } catch (e) {
    const msg = (e && e.message) ? e.message : String(e);
    const hint = "TTL structure is missing required fields for the MCO parser (e.g., contract root, parties, lists). Try regenerating with the default template.";
    const err = new Error(`MCO parse error: ${msg}. ${hint}`);
    err.code = "PARSER_MCO";
    throw err;
  }
}

module.exports = { parseTextService };
