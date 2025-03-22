const pool = require("../config/db");
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
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, email, hashedPassword, role || "simple-user"]
    );

    return newUser.rows[0];
};

//   Find user by email
const findUserByEmail = async (email) => {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return user.rows[0] || null;
};

//   Update refresh token
const updateRefreshToken = async (userId, refreshToken) => {
    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, userId]);
};

//   Clear refresh token (Logout)
const clearRefreshToken = async (token) => {
    await pool.query("UPDATE users SET refresh_token = NULL WHERE refresh_token = $1", [token]);
};

//   Reset Password Token
const generateResetToken = async (email) => {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // Expires in 1 hour

    await pool.query("UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3", [
        resetToken,
        expires,
        email,
    ]);

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
