const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

async function uploadMetadataToPinata(metadata) {
  try {
    // Sauvegarde temporaire du JSON
    const tempFile = "metadata.json";
    fs.writeFileSync(tempFile, JSON.stringify(metadata));

    const data = new FormData();
    data.append("file", fs.createReadStream(tempFile));

    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

    const res = await axios.post(url, data, {
      maxContentLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
    });

    // Optionnel : Supprime le fichier temporaire
    fs.unlinkSync(tempFile);

    return res.data.IpfsHash; // Renvoie le CID du JSON uploadé
  } catch (error) {
    console.error("Erreur lors de l'upload des métadonnées vers Pinata:", error.message);
    throw error;
  }
}

module.exports = uploadMetadataToPinata;
