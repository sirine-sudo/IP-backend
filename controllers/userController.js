const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
 const { User } = require("../models"); // ✅ Sequelize Model
const bcrypt = require("bcryptjs");
 
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
    const { email, password, ethereum_address } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check Ethereum address if provided
    if (user.ethereum_address && ethereum_address && user.ethereum_address !== ethereum_address) {
        return res.status(403).json({ message: "Ethereum address mismatch!" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
  
    await updateRefreshToken(user.id, refreshToken);


    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ethereum_address: user.ethereum_address,
        accessToken,
        refreshToken,
    });
});

//   Refresh Token
const refreshToken = asyncHandler(async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(401).json({ message: "No refresh token provided" });

        const user = await User.findOne({
            where: { refresh_token: token },
            attributes: ["id", "name", "email", "password", "role", "ethereum_address", "createdAt", "updatedAt", "refresh_token"]
        });
        
        if (!user) return res.status(403).json({ message: "Invalid refresh token" });

        jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token" });

            const accessToken = generateAccessToken(user);
            res.json({ accessToken });
        });
    } catch (error) {
        console.error("Error refreshing token:", error);
        res.status(500).json({ message: "Internal server error" });
    }
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
    const user = await User.findOne({ where: { reset_token: token, reset_expires: { [Op.gt]: new Date() } } });

    if (user.rows.length === 0) return res.status(400).json({ message: "Token invalid or expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2", [
        hashedPassword,
        user.rows[0].id,
    ]);

    res.json({ message: "Password successfully reset" });
});

//   Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: ["id", "name", "email", "role", "ethereum_address"],
        });
        
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.rows[0]); // 🔹 Send ethereum_address in response
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server error" });
    }
};


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
const connectWallet = asyncHandler(async (req, res) => {
    const { ethereum_address } = req.body;
    const userId = req.user.id;

    if (!ethereum_address) {
        return res.status(400).json({ message: "Ethereum address is required" });
    }

    // Update user with Ethereum address
    await pool.query("UPDATE users SET ethereum_address = $1 WHERE id = $2", [ethereum_address, userId]);

    res.status(200).json({ message: "Ethereum wallet linked successfully!" });
});

module.exports = {  registerUser, loginUser, refreshToken, forgotPassword, resetPassword, getUserProfile, logoutUser ,connectWallet };
