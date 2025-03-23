const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models"); // ✅ Sequelize Model

const authMiddleware = async (req, res, next) => {
    let token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Accès refusé. Aucun token fourni." });
    }

    try {
        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1]; // 🔥 Supprime "Bearer "
        } else {
            return res.status(401).json({ error: "Format de token invalide." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // ✅ Stocker l'utilisateur décodé
        next();
    } catch (err) {
        console.error("Erreur JWT :", err);
        res.status(401).json({ error: "Token invalide." });
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
