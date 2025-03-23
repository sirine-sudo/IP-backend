const { createIP, getAllIPs, getIPById } = require("../services/ipService");
 
const createIPController = async (req, res) => {
  try {
    const newIP = await createIP(req.body);
    res.status(201).json(newIP);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
