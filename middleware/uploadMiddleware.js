const multer = require("multer");
const path = require("path");

// Configuration du stockage local temporaire
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Dossier temporaire
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;
