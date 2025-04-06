const { User } = require("../models"); 

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

//   Generate Access Token (15 min expiry)
const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "4h" });
};

//   Generate Refresh Token (7 days expiry)
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

//   Register a new user
const registerUserService = async ({ name, email, password, role }) => {
    // Vérification des paramètres
    if (!name || !email || !password || !role) {
        throw new Error("Tous les champs (name, email, password, role) sont requis.");
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            throw new Error("L'utilisateur avec cet email existe déjà. Veuillez utiliser un autre email.");
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        return newUser;
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'utilisateur :", error.message);
        throw new Error(error.message || "Une erreur est survenue lors de l'inscription.");
    }
};

// Trouver un utilisateur par email avec Sequelize
const findUserByEmail = async (email) => {
    return await User.findOne({ where: { email } });
};

// Mettre à jour le refresh token avec Sequelize
const updateRefreshToken = async (userId, refreshToken) => {
    await User.update({ refresh_token: refreshToken }, { where: { id: userId } });
};

// Effacer le refresh token (Logout) avec Sequelize
const clearRefreshToken = async (token) => {
    await User.update({ refresh_token: null }, { where: { refresh_token: token } });
};

// Générer un token de réinitialisation de mot de passe avec Sequelize
const generateResetToken = async (email) => {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1h

    await User.update({ reset_token: resetToken, reset_expires: expires }, { where: { email } });

    return resetToken;
};
//  Admin : Voir tous les utilisateurs
const getAllUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ["id", "name", "email", "role", "ethereum_address"], // Ne pas envoyer password
        order: [['createdAt', 'DESC']], // Plus récent d'abord
      });
      res.json(users);
    } catch (error) {
      console.error("Erreur getAllUsers:", error.message);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    registerUserService,
    findUserByEmail,
    updateRefreshToken,
    clearRefreshToken,
    generateResetToken,getAllUsers
};
