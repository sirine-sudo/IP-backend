require("dotenv").config(); 
const { Pool } = require("pg");

console.log("Connecting to DB with user:", process.env.DB_USER);
console.log("DB Password Type:", typeof process.env.DB_PASS);  // ✅ Debugging

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.connect()
    .then(() => console.log("PostgreSQL Connected"))
    .catch((err) => console.error("Connection error", err.stack));

module.exports = pool;
