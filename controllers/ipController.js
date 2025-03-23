const {  getAllIPs, getIPById } = require("../services/ipService");
const { IP } = require("../models");  // 🔥 Import du modèle IP
const createIPController = async (req, res) => {
  try {
    console.log("Token décodé :", req.user);  // 🔥 Vérifie que `req.user` est bien rempli

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Utilisateur non authentifié." });
    }

    const creator_id = req.user.id;
    const { title, description, type, royalty_percentage } = req.body;

    if (!title) return res.status(400).json({ error: "Le champ 'title' est requis." });
    if (!description) return res.status(400).json({ error: "Le champ 'description' est requis." });
    if (!type) return res.status(400).json({ error: "Le champ 'type' est requis." });
    if (!req.file) return res.status(400).json({ error: "Le fichier est requis." });

    const file_url = `/uploads/${req.file.filename}`;

    // Ajout des valeurs par défaut pour éviter les erreurs
    const ipfs_cid = req.body.ipfs_cid || "default-ipfs-cid";
    const owner_address = req.body.owner_address || "default-owner-address";
    const nft_token_id = req.body.nft_token_id || "default-token-id";
    const views = req.body.views || 0;

    const newIP = await IP.create({
      title,
      description,
      type,
      file_url,
      creator_id,
      ipfs_cid,
      owner_address,
      nft_token_id,
      royalty_percentage: royalty_percentage || 0,
      views,
    });

    res.status(201).json(newIP);
  } catch (error) {
    console.error("Erreur lors de la création de l'IP :", error);
    res.status(500).json({ error: "Erreur lors de la création de l'IP", details: error.message });
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
