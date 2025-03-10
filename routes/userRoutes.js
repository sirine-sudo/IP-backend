const express = require("express");
const { registerUser, loginUser, refreshToken , forgotPassword, resetPassword  } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);

// Routes protégées
router.get("/admin", protect(["admin"]), (req, res) => res.json({ message: "Admin access granted" }));
router.get("/ip-owner", protect(["admin", "ip-owner"]), (req, res) => res.json({ message: "IP Owner access granted" }));


//passwod
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
