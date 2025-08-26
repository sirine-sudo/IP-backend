const { ethers } = require("ethers");

function normalizeSpec(input, fallbackAccount) {
  const s = input || {};

  let parties = [];
  if (Array.isArray(s.parties)) parties = s.parties;
  if (s.addresses && typeof s.addresses === "object") {
    for (const v of Object.values(s.addresses)) if (isAddr(v)) parties.push(v);
  }
  if (!parties.length && isAddr(fallbackAccount)) parties = [fallbackAccount];
  parties = uniq(parties);

  return {
    identifier: s.identifier || "MCO-CONTRACT",
    parties,
    deonticExpressionsIds: asUintArray(s.deonticExpressionsIds),
    objects: asUintArray(s.objects),
    relatedContracts: Array.isArray(s.relatedContracts) ? s.relatedContracts.filter(isAddr) : [],
    relations: asUintArray(s.relations),
    incomeBeneficiaries: Array.isArray(s.income?.beneficiaries) ? s.income.beneficiaries.filter(isAddr) : [],
    incomePercentages: Array.isArray(s.income?.percentages) ? s.income.percentages.map(toUint) : [],
    contentUri: s.contentUri || "",
    contentHash: s.contentHash || "0x",
    token: {
      name: s.token?.name || "MCO-NFT",
      symbol: s.token?.symbol || "MCO"
    }
  };
}

const isAddr = a => { try { return !!a && ethers.isAddress(a); } catch { return false; } };
const uniq = arr => [...new Map(arr.map(a => [a.toLowerCase(), a])).values()];
const toUint = x => (Number.isFinite(+x) && +x >= 0) ? Math.floor(+x) : 0;
const asUintArray = a => Array.isArray(a) ? a.map(toUint) : [];

module.exports = { normalizeSpec };
