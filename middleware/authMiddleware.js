const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const pool = require("../config/db");

const protect = asyncHandler(async (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer ")) {
        try {
            token = token.split(" ")[1]; // Remove "Bearer " prefix
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [decoded.id]);
            
            if (user.rows.length === 0) {
                return res.status(401).json({ message: "User not found" });
            }

            req.user = user.rows[0]; // Attach user data to request
            next();
        } catch (error) {
            console.error("Token validation failed:", error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
});

module.exports = { protect };
