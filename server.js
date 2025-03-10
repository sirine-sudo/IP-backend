const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const pool = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const createUserTable = require("./models/userModel");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

// Vérifier et créer la table au démarrage du serveur
createUserTable().then(() => console.log("Table users vérifiée/créée."));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));