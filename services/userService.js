const { User } = require("../models"); // ✅ Sequelize Model

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
const registerUserService = async (name, email, password, role) => {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "simple-user",
    });

    return newUser;
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


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    registerUserService,
    findUserByEmail,
    updateRefreshToken,
    clearRefreshToken,
    generateResetToken,
};
