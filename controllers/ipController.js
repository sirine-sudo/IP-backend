const { createIP, getAllIPs, getIPById } = require("../services/ipService");
 
const createIPController = async (req, res) => {
    try {
        console.log("🔍 Received data in Controller:", req.body);
        console.log("👤 Authenticated User:", req.user);

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "❌ Request body is missing" });
        }

        if (!req.user) {
            return res.status(401).json({ message: "❌ Unauthorized: No user found in request" });
        }

        const { title, description, type, ipfs_cid, file_url, nft_token_id } = req.body;
        const creator_id = req.user.id;
        let owner_address = req.user.ethereum_address || "0x0000000000000000000000000000000000000000";

        console.log("📌 Final Data:", { title, description, type, ipfs_cid, file_url, creator_id, owner_address, nft_token_id });

        if (!title || !type || !ipfs_cid || !file_url || !creator_id || !owner_address || !nft_token_id) {
            return res.status(400).json({ message: "❌ Missing required fields" });
        }

        const newIP = await createIP({
            title,
            description,
            type,
            ipfs_cid,
            file_url,
            creator_id,
            owner_address,
            nft_token_id,
        });

        res.status(201).json(newIP);
    } catch (error) {
        console.error("❌ Error creating IP:", error.message);
        res.status(500).json({ message: "❌ Server error" });
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

module.exports = { createIPController, getAllIPsController, getIPByIdController };
