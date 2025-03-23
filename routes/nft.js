const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

const uploadMetadataToPinata = async (metadata) => {
  try {
    const jsonData = JSON.stringify(metadata);
    fs.writeFileSync("metadata.json", jsonData);

    const formData = new FormData();
    formData.append("file", fs.createReadStream("metadata.json"));

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    return res.data.IpfsHash; // CID du fichier JSON
  } catch (error) {
    console.error("Erreur lors de l'upload des métadonnées sur Pinata :", error);
    throw error;
  }
};

module.exports = uploadMetadataToPinata;
