const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Assurez-vous que le chemin est correct
const User = require("./User"); 

const IP = sequelize.define("IP", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Génération automatique d'un UUID
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    type: {
        type: DataTypes.ENUM("audio", "image", "video", "book", "other"),
        allowNull: false,
    },
    ipfs_cid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // Liaison avec le modèle User
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    owner_address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nft_token_id: {
        type: DataTypes.STRING, // Peut être un BigInt on-chain, donc String pour éviter les erreurs
        allowNull: false,
    },
}, {
    timestamps: true, // Active `createdAt` et `updatedAt`
    tableName: "ips",
});

User.hasMany(IP, { foreignKey: "creator_id" });
IP.belongsTo(User, { foreignKey: "creator_id" });

module.exports = IP;
