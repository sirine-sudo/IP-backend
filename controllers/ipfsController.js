const fs = require("fs");
const path = require("path");
const { uploadToIPFS } = require("../utils/pinata");

const uploadMetadataJSON = async (req, res) => {
  try {
    const { name, description, image, royalty_percentage } = req.body;

    if (!name || !description || !image) {
      return res.status(400).json({ error: "Champs requis manquants." });
    }

    const metadata = {
      name,
      description,
      image,
      royalty_percentage,
    };

    const tempPath = path.join(__dirname, "../temp/metadata.json");
    fs.writeFileSync(tempPath, JSON.stringify(metadata));

    const ipfsCid = await uploadToIPFS(tempPath);
    if (!ipfsCid) {
      throw new Error("❌ Aucun CID retourné par uploadToIPFS");
    }
    
    fs.unlinkSync(tempPath);

    const uri = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;
    res.status(200).json({ cid: ipfsCid });
} catch (error) {
    console.error("Erreur lors de l'upload des métadonnées JSON :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { uploadMetadataJSON };
