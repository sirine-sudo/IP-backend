const {  getAllIPs, getIPById } = require("../services/ipService");
const { IP } = require("../models");  // 🔥 Import du modèle IP
const uploadToIPFS = require("../utils/pinata");
 const fs = require("fs");
const createIPController = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Utilisateur non authentifié." });
    }

    if (!req.file) return res.status(400).json({ error: "Le fichier est requis." });

    const { title, description, type, royalty_percentage } = req.body;
    const creator_id = req.user.id;

    // 🔥 Upload vers IPFS (Pinata)
    const ipfsCid = await uploadToIPFS(req.file.path);
    const file_url = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;

    // Enregistrement en base de données
    const newIP = await IP.create({
      title,
      description,
      type,
      file_url,
      ipfs_cid: ipfsCid,
      owner_address: req.user.walletAddress || "unknown",
      nft_token_id: "pending", // NFT pas encore minté
      creator_id,
      royalty_percentage: royalty_percentage || 0,
      views: 0,
    });

    // 🗑️ Supprimer le fichier temporaire
    fs.unlinkSync(req.file.path);

    res.status(201).json(newIP);
  } catch (error) {
    console.error("Erreur lors de l'upload IP:", error);
    res.status(500).json({ error: "Erreur lors de l'upload", details: error.message });
  }
};



const getAllIPsController = async (req, res) => {
  try {
    const ips = await getAllIPs();
    return res.status(200).json(ips);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getIPByIdController = async (req, res) => {
  try {
    const ip = await getIPById(req.params.id);
    return res.status(200).json(ip);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

module.exports = { createIPController, getAllIPsController, getIPByIdController };
