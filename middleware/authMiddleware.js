const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models"); //  Sequelize Model

const authMiddleware = async (req, res, next) => {
    let token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Accès refusé. Aucun token fourni." });
    }

    try {
        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1]; //  Supprime "Bearer "
        } else {
            return res.status(401).json({ error: "Format de token invalide." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  //  Stocker l'utilisateur décodé
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
            token = token.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findOne({
                where: { id: decoded.id },
                attributes: ["id", "name", "email", "role"],
            });

            if (!user) {
                return res.status(401).json({ message: "Utilisateur non trouvé" });
            }

            req.user = user; //  Injecte l'utilisateur dans la requête
            next();
        } catch (error) {
            console.error("Échec de validation du token:", error);
            res.status(401).json({ message: "Non autorisé, token invalide" });
        }
    } else {
        res.status(401).json({ message: "Non autorisé, pas de token" });
    }
});

// 🔥 Ajoute cette fonction ADMIN
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Accès interdit : Admin uniquement" });
    }
};

// ⬇️ EXPORT tout correctement
module.exports = { authMiddleware, protect, isAdmin };
