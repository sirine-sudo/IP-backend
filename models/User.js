const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("simple-user", "ip-owner", "admin"),
        defaultValue: "simple-user",
    },
    refresh_token: { // Vérifie bien cette partie
        type: DataTypes.TEXT,
        allowNull: true, // ou false selon ton besoin
    },
    ethereum_address: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    tableName: "users",
});

module.exports = User;  
