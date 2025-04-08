const ethers = require("ethers"); 
const contractABI = require("../abis/MyNFT.json");
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const whitelistUser = async (req, res) => {
  try {
    const { userAddress } = req.body;
    if (!userAddress) return res.status(400).json({ error: "Adresse Ethereum requise" });

    const provider = new ethers.JsonRpcProvider(process.env.API_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, wallet);

    const tx = await contract.addToWhitelist(userAddress);
    await tx.wait();

    res.json({ message: "✅ Utilisateur ajouté à la whitelist !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur whitelist" });
  }
};

const checkWhitelistStatus = async (req, res) => {
  try {
    const { userAddress } = req.query;

    if (!userAddress) {
      return res.status(400).json({ error: "Adresse Ethereum requise." });
    }

    const provider = new ethers.JsonRpcProvider(process.env.API_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);

    const isWhitelisted = await contract.isWhitelisted(userAddress);  
    res.json({ isWhitelisted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la vérification de la whitelist." });
  }
};

module.exports = { whitelistUser, checkWhitelistStatus };
