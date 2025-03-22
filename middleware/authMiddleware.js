const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models"); // ✅ Sequelize Model

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

module.exports = { protect };
