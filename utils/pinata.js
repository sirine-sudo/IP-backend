const axios = require("axios");
const FormData = require("form-data");

require("dotenv").config();
const crypto = require("crypto");
const fs = require("fs");

function generateFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
}

const uploadToIPFS = async (filePath) => {
  try {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const formData = new FormData();
    
    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
    });

    return response.data.IpfsHash; // CID du fichier uploadé
  } catch (error) {
    console.error("Erreur lors de l'upload vers IPFS:", error);
    throw error;
  }
};

module.exports = {uploadToIPFS,generateFileHash};
