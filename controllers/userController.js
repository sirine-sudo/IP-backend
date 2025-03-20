const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs"); 
const pool = require("../config/db"); 
const {
    generateAccessToken,
    generateRefreshToken,
    registerUserService,
    findUserByEmail,
    updateRefreshToken,
    clearRefreshToken,
    generateResetToken,
} = require("../services/userService");
const sendResetEmail = require("../config/email");

//   Register User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Please add all fields" });

    const newUser = await registerUserService(name, email, password, role);

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    await updateRefreshToken(newUser.id, refreshToken);

    res.status(201).json({
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        accessToken,
        refreshToken,
    });
});

//   Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await updateRefreshToken(user.id, refreshToken);

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken,
    });
});

//   Refresh Token
const refreshToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "No refresh token provided" });

    const user = await findUserByEmail(token);
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid refresh token" });

        const accessToken = generateAccessToken(decoded);
        res.json({ accessToken });
    });
});

//   Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Email not found" });

    const resetToken = await generateResetToken(email);
    await sendResetEmail(email, resetToken);

    res.json({ message: "Password reset email sent" });
});

//   Reset Password
const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()", [token]);

    if (user.rows.length === 0) return res.status(400).json({ message: "Token invalid or expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2", [
        hashedPassword,
        user.rows[0].id,
    ]);

    res.json({ message: "Password successfully reset" });
});

//   Get User Profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [req.user.id]);

    if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json(user.rows[0]);
});

//   Logout User
const logoutUser = asyncHandler(async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "No token provided" });

        await clearRefreshToken(token);
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = { registerUser, loginUser, refreshToken, forgotPassword, resetPassword, getUserProfile, logoutUser };
