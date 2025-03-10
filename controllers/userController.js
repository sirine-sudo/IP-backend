const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const pool = require("../config/db");
const crypto = require("crypto");
const sendResetEmail = require("../config/email");

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
        return res.status(400).json({ message: "Email non enregistré" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // Expire dans 1 heure

    await pool.query(
        "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3",
        [resetToken, expires, email]
    );

    await sendResetEmail(email, resetToken);
    res.json({ message: "Email de réinitialisation envoyé" });
});

// Fonction pour générer un Access Token (expire en 15 minutes)
const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

// Fonction pour générer un Refresh Token (expire en 7 jours)
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please add all fields");
    }
    
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
        res.status(400);
        throw new Error("User already exists");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, email, hashedPassword, role || "simple-user"]
    );

    const accessToken = generateAccessToken(newUser.rows[0]);
    const refreshToken = generateRefreshToken(newUser.rows[0]);

    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, newUser.rows[0].id]);

    res.status(201).json({
        _id: newUser.rows[0].id,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role,
        accessToken,
        refreshToken
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length > 0 && (await bcrypt.compare(password, user.rows[0].password))) {
        const accessToken = generateAccessToken(user.rows[0]);
        const refreshToken = generateRefreshToken(user.rows[0]);

        await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, user.rows[0].id]);

        res.json({
            _id: user.rows[0].id,
            name: user.rows[0].name,
            email: user.rows[0].email,
            role: user.rows[0].role,
            accessToken,
            refreshToken
        });
    } else {
        res.status(400);
        throw new Error("Invalid credentials");
    }
});

const refreshToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    const user = await pool.query("SELECT * FROM users WHERE refresh_token = $1", [token]);
    if (user.rows.length === 0) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid refresh token" });

        const accessToken = generateAccessToken(decoded);
        res.json({ accessToken });
    });
});
const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const user = await pool.query(
        "SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()",
        [token]
    );

    if (user.rows.length === 0) {
        return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
        "UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2",
        [hashedPassword, user.rows[0].id]
    );

    res.json({ message: "Mot de passe réinitialisé avec succès" });
});


module.exports = { registerUser, loginUser,refreshToken,forgotPassword ,resetPassword};