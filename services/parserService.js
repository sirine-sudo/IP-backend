// services/parserService.js
"use strict";

/**
 * Service Parser TTL → MCO
 * - Gère uniquement la transformation d'un fichier TTL vers un objet MCO
 */

const { getContractFromMCO } = require("../../ISO IEC 21000-23/MPEG-21 MCO Parser/index");

/**
 * Parse un contenu TTL (string) et retourne un objet MCO.
 * @param {string} content - Contenu du fichier TTL
 * @returns {object} Parsed MCO object
 */
function parseTTLFile(content) {
  if (!content || !content.trim().length) {
    throw new Error("TTL file is empty or invalid");
  }
  const parsed = getContractFromMCO(content);
  console.log("✅ TTL Parsed to MCO:", JSON.stringify(parsed, null, 2));
  return parsed;
}

module.exports = {
  parseTTLFile,
};
