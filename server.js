const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const { sequelize } = require("./models");  
const ipRoutes = require("./routes/ipRoutes");
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/api/users", userRoutes);


app.use("/api/ips", ipRoutes);

console.log("DB_PASSWORD value:", process.env.DB_PASSWORD, "Type:", typeof process.env.DB_PASSWORD);

// 🔹 Synchronisation de la base avec Sequelize
sequelize.sync({ alter: true })
    .then(() => console.log("Database synchronized"))
    .catch((err) => console.error("Error syncing database:", err));

const PORT = process.env.PORT || 5000;
 

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
