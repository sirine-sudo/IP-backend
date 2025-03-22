const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models"); // ✅ Sequelize Model

const authMiddleware = async (req, res, next) => {
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    try {
      const token = req.headers.authorization?.split(" ")[1]; // Extract token from header
      if (!token) return res.status(401).json({ message: "Unauthorized: No token" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id);
      if (!req.user) return res.status(401).json({ message: "Unauthorized: Invalid user" });
  
      next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
const protect = asyncHandler(async (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer ")) {
        try {
            token = token.split(" ")[1]; // Remove "Bearer " prefix
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 🔥 Utilisation de Sequelize au lieu de pool.query()
            const user = await User.findOne({
                where: { id: decoded.id },
                attributes: ["id", "name", "email", "role"], // Sélectionner les champs nécessaires
            });

            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            req.user = user; // Attacher l'utilisateur à la requête
            next();
        } catch (error) {
            console.error("Token validation failed:", error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
});

module.exports = { authMiddleware  ,protect};
