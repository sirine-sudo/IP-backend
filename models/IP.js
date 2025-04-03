const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const IP = sequelize.define("IP", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
            model: User,
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
        type: DataTypes.STRING,
        allowNull: false,
    },
    royalty_percentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Initialiser à 0
    },file_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      }
      
}, {
    timestamps: true,
    tableName: "ips",
});

User.hasMany(IP, { foreignKey: "creator_id" });
IP.belongsTo(User, { foreignKey: "creator_id" });

module.exports = IP;
