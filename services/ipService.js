const IP = require("../models/IP");

const createIP = async (ipData) => {
    try {
        console.log("📦 Data received in service:", ipData);

        if (!ipData) {
            throw new Error("❌ No data provided to createIP");
        }

        const { title, description, type, ipfs_cid, file_url, creator_id, owner_address, nft_token_id } = ipData;

        if (!title || !type || !ipfs_cid || !file_url || !creator_id || !owner_address || !nft_token_id) {
            throw new Error("❌ Missing required fields in createIP");
        }

        const newIP = await IP.create({
            title,
            description,
            type,
            ipfs_cid,
            file_url,
            creator_id,
            owner_address,
            nft_token_id,
        });

        return newIP;
    } catch (error) {
        console.error("❌ Error in createIP:", error.message);
        throw error;
    }
};

module.exports = { createIP };

const getAllIPs = async () => {
  try {
    return await IP.findAll();
  } catch (error) {
    throw new Error("Error fetching IPs: " + error.message);
  }
};

const getIPById = async (id) => {
  try {
    const ip = await IP.findByPk(id);
    if (!ip) throw new Error("IP not found");
    return ip;
  } catch (error) {
    throw new Error("Error fetching IP: " + error.message);
  }
};

module.exports = { createIP, getAllIPs, getIPById };
