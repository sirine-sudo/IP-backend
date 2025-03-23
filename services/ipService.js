const IP = require("../models/IP");

const createIP = async function createIP(ipData) {
  try {
    console.log("Received data in service:", ipData);
    console.log("Data object keys:", Object.keys(ipData || {}));

    if (!ipData) {
      throw new Error("Le corps de la requête est vide.");
    }

    const { title, description, type, ipfs_cid, file_url, creator_id, owner_address, nft_token_id, royalty_percentage, views } = ipData;

    if (!title) throw new Error("Le titre est requis.");
    if (!type) throw new Error("Le type est requis.");
    if (!ipfs_cid) throw new Error("L'IPFS CID est requis.");
    if (!file_url) throw new Error("L'URL du fichier est requise.");
    if (!creator_id) throw new Error("L'ID du créateur est requis.");
    if (!owner_address) throw new Error("L'adresse du propriétaire est requise.");
    if (!nft_token_id) throw new Error("L'ID du token NFT est requis.");

    const newIP = await IP.create({
      title,
      description,
      type,
      ipfs_cid,
      file_url,
      creator_id,
      owner_address,
      nft_token_id,
      royalty_percentage,
      views
    });

    return newIP;
  } catch (error) {
    console.error("Erreur lors de la création de l'IP:", error);
    throw error; // Propager l'erreur au contrôleur
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
