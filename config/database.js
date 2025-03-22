const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false, // Désactiver les logs SQL (optionnel)
});

sequelize.authenticate()
    .then(() => console.log("✅ Connected to the database"))
    .catch((err) => console.error("❌ Database connection error:", err));

module.exports = sequelize;
