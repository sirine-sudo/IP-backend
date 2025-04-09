const { getAllIPs, getIPById } = require("../services/ipService");
const { IP } = require("../models");
const { uploadToIPFS, generateFileHash } = require("../utils/pinata");
const fs = require("fs");
const { User } = require("../models");

const createIPController = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Utilisateur non authentifié." });
    }

    if (!req.file) return res.status(400).json({ error: "Le fichier est requis." });

    const { title, description, type, royalty_percentage, price, preferred_creator_name } = req.body;
    const creator_id = req.user.id;
    const fileHash = generateFileHash(req.file.path);
    const ipfsCid = await uploadToIPFS(req.file.path);

    const file_url = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;

    // Enregistrement en base de données
    const newIP = await IP.create({
      title,
      description,
      type,
      file_url,
      ipfs_cid: ipfsCid,
      owner_address: req.user.walletAddress || "Pas encore minté",
      nft_token_id: "pending",
      file_hash: fileHash,
      smart_contract_address: "",
      creator_id,
      royalty_percentage: royalty_percentage || 0,
      is_for_sale: false,
      price: price || null,
      preferred_creator_name: preferred_creator_name || "",
    });

    //  Supprimer le fichier temporaire
    fs.unlinkSync(req.file.path);

    //  Vérifier le nombre d'IPs et mettre à jour le rôle
    const userIPs = await IP.count({ where: { creator_id } });

    if (userIPs > 1) {
      await User.update({ role: "ip-owner" }, { where: { id: creator_id } });
    }

    res.status(201).json(newIP);
  } catch (error) {
    console.error("Erreur lors de l'upload IP:", error);
    res.status(500).json({ error: "Erreur lors de l'upload", details: error.message });
  }
};
const updateIPMetadata = async (req, res) => {
  try {
    const { title, description, royalty_percentage } = req.body;
    const { id } = req.params;

    const updated = await IP.update(
      { title, description, royalty_percentage },
      { where: { id } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ error: "IP non trouvée" });
    }

    res.status(200).json({ message: "Metadonnées mises à jour avec succès" });
  } catch (error) {
    console.error("Erreur update-metadata:", error);
    res.status(500).json({ error: error.message });
  }
};


const updateTokenId = async (req, res) => {
  try {
    const { nft_token_id, owner_address, smart_contract_address } = req.body;
    const { id } = req.params;

    if (!nft_token_id) return res.status(400).json({ error: "tokenId manquant" });

    const updated = await IP.update(
      { nft_token_id, owner_address, smart_contract_address },
      { where: { id } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ error: "IP non trouvée" });
    }

    res.status(200).json({ message: "Mise à jour réussie", tokenId: nft_token_id });
  } catch (error) {
    console.error("Erreur update-token:", error);
    res.status(500).json({ error: error.message });
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
//  Fonction pour supprimer un IP par ID
const deleteIP = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await IP.destroy({ where: { id } });

    if (deleted) {
      return res.status(200).json({ message: " IP supprimée avec succès." });
    } else {
      return res.status(404).json({ error: " IP non trouvée." });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
}; const updateSaleStatus = async (req, res) => {
  try {
    const { is_for_sale, price } = req.body;
    const { id } = req.params;

    const updated = await IP.update(
      { is_for_sale, price },
      { where: { id } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ error: "IP non trouvée" });
    }

    res.status(200).json({ message: "Statut de vente mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur update-sale-status:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { updateTokenId, createIPController, getAllIPsController, getIPByIdController, updateIPMetadata, deleteIP, updateSaleStatus };
