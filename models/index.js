const sequelize = require("../config/database");
const User = require("./User");
const IP = require("./IP");

User.hasMany(IP, { foreignKey: "creator_id" });
IP.belongsTo(User, { foreignKey: "creator_id" });

module.exports = { sequelize, User, IP };
