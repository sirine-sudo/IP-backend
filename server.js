const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const { sequelize } = require("./models");  
const ipRoutes = require("./routes/ipRoutes");
const editorRoutes = require("./routes/editor");
const { User } = require("./models"); 
const bcrypt = require("bcryptjs");    //  Pour hasher le mot de passe
const fs = require("fs");
const whitelistRoutes = require("./routes/whitelistRoutes");
const parserRoutes = require("./routes/parserRoutes");

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/api/users", userRoutes);
app.use("/api/ips", ipRoutes);
app.use("/api/editor", editorRoutes);
app.use("/api/whitelist", whitelistRoutes);
app.use("/api", parserRoutes);

//  Créer les dossiers si n'existent pas
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

console.log("DB_PASSWORD value:", process.env.DB_PASSWORD, "Type:", typeof process.env.DB_PASSWORD);

//  Fonction pour créer Admin par défaut
const createDefaultAdmin = async () => {
  try {
    const adminEmail = "ip.management2025@gmail.com"; //  Change l'email si tu veux
    const adminPassword = "admin2025";       //  Change le mot de passe aussi

    const existingAdmin = await User.findOne({ where: { role: "admin" } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`✅ Admin créé : ${adminEmail} / ${adminPassword}`);
    } else {
      console.log(`ℹ️ Un Admin existe déjà  : ${adminEmail} / ${adminPassword} `);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'admin par défaut :", error.message);
  }
};

//  Synchronisation + Création Admin
sequelize.sync({ alter: true })
  .then(async () => {
    console.log("✅ Base de données synchronisée.");
    await createDefaultAdmin(); // Appelle la fonction après sync
  })
  .catch((err) => console.error("Error syncing database:", err));

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
