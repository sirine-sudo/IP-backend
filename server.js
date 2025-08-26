// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");

// Routes existantes de ton app
const userRoutes = require("./routes/userRoutes");
const ipRoutes = require("./routes/ipRoutes");
const editorRoutes = require("./routes/editor");
const whitelistRoutes = require("./routes/whitelistRoutes");

// NOUVELLES routes séparées
const parserRoutes = require("./routes/parser.routes");   // assure-toi que le fichier s'appelle bien parser.routes.js
const deployRoutes = require("./routes/deploy.routes");   // assure-toi que le fichier s'appelle bien deploy.routes.js

// DB
const { sequelize, User } = require("./models");
const bcrypt = require("bcryptjs");

dotenv.config();
const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Mount routes
app.use("/api/users", userRoutes);
app.use("/api/ips", ipRoutes);
app.use("/api/editor", editorRoutes);
app.use("/api/whitelist", whitelistRoutes);

// IMPORTANT : ces deux lignes montent /api/parse et /api/deploy
app.use("/api", parserRoutes);    
app.use("/api", deployRoutes); 

// Health
app.get("/health", (_, res) => res.json({ ok: true }));

// Créer les dossiers si absents
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

// Debug env (optionnel)
console.log("DB_PASSWORD value:", process.env.DB_PASSWORD, "Type:", typeof process.env.DB_PASSWORD);

// Admin par défaut
const createDefaultAdmin = async () => {
  try {
    const adminEmail = "ip.management2025@gmail.com";
    const adminPassword = "admin2025";

    const existingAdmin = await User.findOne({ where: { role: "admin" } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({ name: "Admin", email: adminEmail, password: hashedPassword, role: "admin" });
      console.log(`✅ Admin créé : ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`ℹ️ Un Admin existe déjà : ${adminEmail} / ${adminPassword}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'admin par défaut :", error.message);
  }
};

// Sync + admin
sequelize.sync({ alter: true })
  .then(async () => {
    console.log("✅ Base de données synchronisée.");
    await createDefaultAdmin();
  })
  .catch((err) => console.error("Error syncing database:", err));

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
