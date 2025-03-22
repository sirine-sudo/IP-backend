const express = require("express");
const { registerUser, loginUser,logoutUser, refreshToken, forgotPassword, resetPassword, getUserProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const { connectWallet } = require("../controllers/userController");

router.post("/connect-wallet", protect, connectWallet);

 
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshToken);

//  Fix: Ensure `protect` is correctly passed as a middleware
router.get("/profile", protect, getUserProfile); 

// Routes protégées
router.get("/admin", protect, (req, res) => res.json({ message: "Admin access granted" }));
router.get("/ip-owner", protect, (req, res) => res.json({ message: "IP Owner access granted" }));

// Password recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
