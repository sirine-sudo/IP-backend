const jwt = require("jsonwebtoken");

const protect = (roles = []) => {
    return (req, res, next) => {
        let token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Not authorized" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Access forbidden" });
            }
            next();
        } catch (error) {
            res.status(401).json({ message: "Invalid token" });
        }
    };
};

module.exports = { protect };
