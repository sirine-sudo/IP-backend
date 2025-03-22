const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const { sequelize } = require("./models");  

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/users", userRoutes);
console.log("DB_PASS value:", process.env.DB_PASS, "Type:", typeof process.env.DB_PASS);

// 🔹 Synchronisation de la base avec Sequelize
sequelize.sync({ alter: true })
    .then(() => console.log("Database synchronized"))
    .catch((err) => console.error("Error syncing database:", err));

const PORT = process.env.PORT || 5000;
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS ? "********" : "Not Found");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_PASS type:", typeof process.env.DB_PASS);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
