const IP = require("../models/IP");

const createIP = async function createIP(ipData) {
  try {
    const { title, description, type } = req.body;
    const file = req.file; // Assurez-vous que Multer est bien configuré pour gérer le fichier

    if (!title || !description || !type || !file) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    const newIP = await IP.create({
        title,
        description,
        type,
        ipfs_cid: "to-be-generated", // Ajoutez une valeur temporaire ou une vraie CID
        file_url: `/uploads/${file.filename}`,
        creator_id: req.user.id, // Assurez-vous que l'utilisateur est bien authentifié
        owner_address: "to-be-generated", // Générer plus tard
        nft_token_id: "to-be-generated", // Générer plus tard
    });

    res.status(201).json(newIP);
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
}
};



const getAllIPs = async () => {
  try {
    return await IP.findAll({
      attributes: ["id", "title", "description", "type", "ipfs_cid", "file_url", "owner_address", "views", "royalty_percentage"],
    });
  } catch (error) {
    throw new Error("Error fetching IPs: " + error.message);
  }
};

const getIPById = async (id) => {
  const ip = await IP.findByPk(id, {
    attributes: ["id", "title", "description", "type", "ipfs_cid", "file_url", "owner_address", "views", "royalty_percentage"],
  });

  if (!ip) {
    throw new Error("IP non trouvée");
  }

  return ip;
};



module.exports = { createIP, getAllIPs, getIPById };
