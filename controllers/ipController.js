const { getAllIPs, getIPById } = require("../services/ipService");
const { IP } = require("../models");
const { uploadToIPFS, generateFileHash } = require("../utils/pinata");
const fs = require("fs");
const { User } = require("../models");

const createIPController = async (req, res) => {
  try {
    console.log("➡️ Début création IP");  // 1

    if (!req.user || !req.user.id) {
      console.log("❌ Utilisateur non authentifié");
      return res.status(401).json({ error: "Utilisateur non authentifié." });
    }

    if (!req.file) {
      console.log("❌ Aucun fichier envoyé");
      return res.status(400).json({ error: "Le fichier est requis." });
    }

    console.log("✅ Utilisateur connecté :", req.user);  // 2
    console.log("✅ Fichier reçu :", req.file.originalname);  // 3

    const { title, description, type, royalty_percentage, price, preferred_creator_name } = req.body;
    const creator_id = req.user.id;
    const fileHash = generateFileHash(req.file.path);
    console.log("✅ Hash du fichier généré :", fileHash);  // 4

    const ipfsCid = await uploadToIPFS(req.file.path);
    console.log("✅ Fichier uploadé sur IPFS. CID :", ipfsCid);  // 5

    const file_url = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;

    const newIP = await IP.create({
      title,
      description,
      type,
      file_url,
      ipfs_cid: ipfsCid,
      owner_address: req.user.ethereum_address || "Pas encore minté",
      nft_token_id: "pending",
      file_hash: fileHash,
      smart_contract_address: "",
      creator_id,
      royalty_percentage: royalty_percentage || 0,
      is_for_sale: false,
      price: price || null,
      preferred_creator_name: preferred_creator_name || "",
    });

    console.log("✅ Nouvelle IP enregistrée :", newIP.id);  // 6

    fs.unlinkSync(req.file.path);
    console.log("🧹 Fichier temporaire supprimé");  // 7

    const userIPs = await IP.count({ where: { creator_id } });
    console.log(`ℹ️ L'utilisateur a maintenant ${userIPs} IP(s)`);  // 8

    if (userIPs > 1) {
      await User.update({ role: "ip-owner" }, { where: { id: creator_id } });
      console.log("✅ Rôle de l'utilisateur mis à jour : ip-owner");  // 9
    }

    const user = await User.findByPk(creator_id, {
      attributes: ["id","email", "ethereum_address"],
    });


    const formattedUser = {
      id: user.id,
      email: user.email,
      ethereum_address: user.ethereum_address || "Non connecté",
    };

    console.log("📤 Envoi de la réponse IP + User");  // 11
    res.status(201).json({ ip: newIP, user: formattedUser });

  } catch (error) {
    console.error("🚨 Erreur lors de l'upload IP :", error);
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
