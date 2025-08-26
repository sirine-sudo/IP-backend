// IP-backend/services/deploy.service.js
require("dotenv").config();
const path = require("path");
const { ethers } = require("ethers");

// ---------- Compatibilité v5 / v6 ----------
const isV6 = !!ethers.parseUnits; // v6 a parseUnits au top-level

const parseUnits = (v, u) =>
  isV6 ? ethers.parseUnits(String(v), u) : ethers.utils.parseUnits(String(v), u);

const isAddress = (a) =>
  isV6 ? ethers.isAddress(a) : ethers.utils.isAddress(a);

const toUtf8Bytes = (s) =>
  isV6 ? ethers.toUtf8Bytes(String(s)) : ethers.utils.toUtf8Bytes(String(s));

const hexlify = (b) =>
  isV6 ? ethers.hexlify(b) : ethers.utils.hexlify(b);

const addBN = (a, b) => (isV6 ? (a + b) : a.add(b));

const JsonRpcProvider = isV6 ? ethers.JsonRpcProvider : ethers.providers.JsonRpcProvider;

// ---------- Artifacts Truffle (ABI + bytecode) ----------
const NFTokenArtifact = require(
  path.resolve(__dirname, "../../ISO IEC 21000-23/scmgenerator-dltmanager/smart-contract-templates/eth/build/contracts/NFToken.json")
);
const ContractArtifact = require(
  path.resolve(__dirname, "../../ISO IEC 21000-23/scmgenerator-dltmanager/smart-contract-templates/eth/build/contracts/Contract.json")
);

// ---------- Utils ----------
const toBytes = (v) => {
  if (!v) return "0x";
  try {
    if (isV6 ? ethers.isHexString(v) : ethers.utils.isHexString(v)) return v;
  } catch {}
  return hexlify(toUtf8Bytes(String(v)));
};

// Mutex simple pour éviter 2 déploiements concurrents avec la même clé
let _deploying = false;
function assertNotDeploying() {
  if (_deploying) throw new Error("Deployment already in progress. Please wait.");
  _deploying = true;
}
function clearDeploying() { _deploying = false; }

// Frais EIP-1559 (compatible v5/v6)
async function getFees(provider) {
  const fd = await provider.getFeeData();
  const tip = fd.maxPriorityFeePerGas ?? parseUnits("1.5", "gwei");
  const max = fd.maxFeePerGas ?? parseUnits("30", "gwei");
  const maxBumped = addBN(max, parseUnits("5", "gwei"));
  return { maxFeePerGas: maxBumped, maxPriorityFeePerGas: tip };
}

// Envoi avec nonce et rattrapage "already known" / "underpriced"
async function sendWithNonce(signer, txRequest, nonce) {
  const provider = signer.provider;
  const fees = await getFees(provider);

  const finalTx = {
    ...txRequest,
    nonce,
    maxFeePerGas: fees.maxFeePerGas,
    maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
  };

  try {
    const resp = await signer.sendTransaction(finalTx);
    const rec = await resp.wait(1);
    return { hash: resp.hash, receipt: rec };
  } catch (e) {
    const msg = String(e?.message || "").toLowerCase();
    if (msg.includes("already known") || msg.includes("replacement transaction underpriced")) {
      // Si on a un hash, attendre la conf
      const hash = e?.transaction?.hash || e?.info?.hash;
      if (hash) {
        const rec = await provider.waitForTransaction(hash, 1);
        if (rec) return { hash, receipt: rec };
      }
      // Sinon, on rebump et on renvoie (même nonce)
      const fees2 = await getFees(provider);
      const bumped = {
        ...finalTx,
        maxPriorityFeePerGas: addBN(fees2.maxPriorityFeePerGas, parseUnits("0.5", "gwei")),
        maxFeePerGas: addBN(fees2.maxFeePerGas, parseUnits("1", "gwei")),
      };
      const resp2 = await signer.sendTransaction(bumped);
      const rec2 = await resp2.wait(1);
      return { hash: resp2.hash, receipt: rec2 };
    }
    throw e;
  }
}

// Déployer via ContractFactory avec nonce contrôlé (agnostique v5/v6)
async function deployWithNonce(factory, signer, args, nonce) {
  // Fabriquer la tx de création du contrat
  const unsigned = await factory.getDeployTransaction(...args);
  const sent = await sendWithNonce(signer, unsigned, nonce);
  // Adresse du contrat depuis le reçu
  const addr = sent.receipt?.contractAddress; // présent pour tx "create"
  return { address: addr, txHash: sent.hash };
}

async function deployOnEthereum(spec) {
  assertNotDeploying();
  try {
    const { PROVIDER_URL, PRIVATE_KEY } = process.env;
    const expected = Number(process.env.CHAIN_ID || 11155111);
    if (!PROVIDER_URL || !PRIVATE_KEY) {
      throw new Error("PROVIDER_URL/PRIVATE_KEY manquants (.env)");
    }

    const provider = new JsonRpcProvider(PROVIDER_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const net = await provider.getNetwork();
    const actualChainId = Number(isV6 ? net.chainId : net.chainId);
    if (actualChainId !== expected) {
      throw new Error(`Mauvais réseau: ${actualChainId} ≠ ${expected}`);
    }

    // Nonce "pending" pour chaîner nos 2 créations (NFT -> Contract)
    let nonce = await provider.getTransactionCount(wallet.address, "pending");

    // 1) NFToken
    const nftFactory = new ethers.ContractFactory(
      NFTokenArtifact.abi,
      NFTokenArtifact.bytecode,
      wallet
    );
    const nftName = spec.token?.name || "MCO-NFT";
    const nftSymbol = spec.token?.symbol || "MCO";
    const nft = await deployWithNonce(nftFactory, wallet, [nftName, nftSymbol], nonce);
    nonce += 1;

    // 2) Contract principal
    const contractFactory = new ethers.ContractFactory(
      ContractArtifact.abi,
      ContractArtifact.bytecode,
      wallet
    );
    const args = [
      toBytes(spec.identifier),
      Array.isArray(spec.parties) ? spec.parties.filter(isAddress) : [],
      nft.address, // NFToken
      Array.isArray(spec.deonticExpressionsIds) ? spec.deonticExpressionsIds.map(n => Number(n) || 0) : [],
      Array.isArray(spec.objects) ? spec.objects.map(n => Number(n) || 0) : [],
      Array.isArray(spec.relatedContracts) ? spec.relatedContracts.filter(isAddress) : [],
      Array.isArray(spec.relations) ? spec.relations.map(n => Number(n) || 0) : [],
      Array.isArray(spec.incomeBeneficiaries) ? spec.incomeBeneficiaries.filter(isAddress) : [],
      Array.isArray(spec.incomePercentages) ? spec.incomePercentages.map(n => Number(n) || 0) : [],
      spec.contentUri || "",
      toBytes(spec.contentHash),
    ];
    const deployed = await deployWithNonce(contractFactory, wallet, args, nonce);

    return {
      network: net.name || "unknown",
      chainId: actualChainId,
      deployer: wallet.address,
      nfToken: nft.address,
      contract: deployed.address,
      txs: { nfToken: nft.txHash, contract: deployed.txHash },
    };
  } finally {
    clearDeploying();
  }
}

module.exports = { deployOnEthereum };
