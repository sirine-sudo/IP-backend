const {  getAllIPs, getIPById } = require("../services/ipService");
const { IP } = require("../models");  // 🔥 Import du modèle IP
const { uploadToIPFS, generateFileHash } = require("../utils/pinata");
 const fs = require("fs");
 const { User } = require("../models");  // 🔥 Import du modèle User
 
 const createIPController = async (req, res) => {
   try {
     if (!req.user || !req.user.id) {
       return res.status(401).json({ error: "Utilisateur non authentifié." });
     }
 
     if (!req.file) return res.status(400).json({ error: "Le fichier est requis." });
 
     const { title, description, type, royalty_percentage } = req.body;
     const creator_id = req.user.id;
     const fileHash = generateFileHash(req.file.path); // 🔑 Correction ici
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
       nft_token_id: "pending",
       file_hash: fileHash,

       creator_id,
       royalty_percentage: royalty_percentage || 0,
       views: 0,
     });
 
     // 🗑️ Supprimer le fichier temporaire
     fs.unlinkSync(req.file.path);
 
     // **🎯 Vérifier le nombre d'IPs et mettre à jour le rôle**
     const userIPs = await IP.count({ where: { creator_id } });

     if (userIPs > 1) {
       await User.update({ role: "ip-owner" }, { where: { id: creator_id } });
       console.log(`✅ Rôle mis à jour pour l'utilisateur ${creator_id} : ip-owner`);
     }
 
     res.status(201).json(newIP);
   } catch (error) {
     console.error("Erreur lors de l'upload IP:", error);
     res.status(500).json({ error: "Erreur lors de l'upload", details: error.message });
   }
 };
 

 const updateTokenId = async (req, res) => {
  try {
    const { nft_token_id, owner_address } = req.body;
    const { id } = req.params;

    const updateFields = { nft_token_id };
    if (owner_address) {
      updateFields.owner_address = owner_address;
    }

    const updated = await IP.update(updateFields, { where: { id } });

    if (updated[0] === 0) {
      return res.status(404).json({ error: "IP non trouvée" });
    }

    res.status(200).json({ message: "Mise à jour réussie", tokenId: nft_token_id, owner: owner_address });
  } catch (error) {
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

module.exports = { updateTokenId,createIPController, getAllIPsController, getIPByIdController };
