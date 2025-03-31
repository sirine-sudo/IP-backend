const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

// Config multer pour uploader dans le dossier 'uploads'
const upload = multer({ dest: "uploads/" });

// ✅ Fonction pour convertir .txt → .srt
const convertTxtToSRT = (inputPath, outputPath) => {
  console.log("📄 Conversion du .txt vers .srt...");

  const lines = fs.readFileSync(inputPath, "utf-8").split("\n").filter(Boolean);
  let srt = "";

  lines.forEach((line, index) => {
    const start = new Date(index * 4000).toISOString().substr(11, 8).replace('.', ',') + "0";
    const end = new Date((index + 1) * 4000).toISOString().substr(11, 8).replace('.', ',') + "0";
    srt += `${index + 1}\n${start} --> ${end}\n${line}\n\n`;
  });

  fs.writeFileSync(outputPath, srt, "utf-8");
  console.log("✅ Fichier .srt généré :", outputPath);
};
router.post("/process", upload.fields([{ name: "audio" }, { name: "lyrics" }]), async (req, res) => {
    console.log("🚀 Nouvelle requête reçue !");
  
    const audio = req.files["audio"]?.[0];
    const lyrics = req.files["lyrics"]?.[0];
  
    if (!audio || !lyrics) {
      console.log("❌ Fichiers manquants.");
      return res.status(400).send("Fichiers manquants.");
    }
  
    const audioPath = audio.path;
    const lyricsPath = lyrics.path;
    const originalExt = path.extname(lyrics.originalname).toLowerCase();
    const outputPath = `outputs/output-${Date.now()}.mp4`;
  
    // S'assurer que le dossier 'outputs' existe
    if (!fs.existsSync("outputs")) {
      fs.mkdirSync("outputs");
      console.log("📂 Dossier 'outputs' créé.");
    }
  
    let srtPath;
  
    if (originalExt === ".txt") {
      // 🔁 Conversion si .txt
      srtPath = lyricsPath + ".srt";
      console.log("📝 .txt détecté, conversion vers .srt");
      convertTxtToSRT(lyricsPath, srtPath);
    } else if (originalExt === ".srt") {
      // ✅ Déjà un .srt
      srtPath = lyricsPath;
      console.log("📄 Fichier .srt détecté, pas de conversion nécessaire.");
    } else {
      return res.status(400).send("❌ Seuls les fichiers .txt ou .srt sont acceptés.");
    }
  
    const cmd = `MP4Box -add ${audioPath} -add ${srtPath}:hdlr=sbtl:lang=fr -new ${outputPath}`;
    console.log("🛠️ Commande GPAC :", cmd);
  
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Erreur GPAC :", stderr);
        return res.status(500).send("Erreur lors du traitement GPAC");
      }
  
      console.log("✅ GPAC terminé !");
      res.download(outputPath, () => {
        console.log("📦 Téléchargement lancé.");
        fs.unlink(audioPath, () => console.log("🧹 Fichier audio supprimé"));
        fs.unlink(lyricsPath, () => console.log("🧹 Fichier original supprimé"));
        if (originalExt === ".txt") {
          fs.unlink(srtPath, () => console.log("🧹 Fichier .srt temporaire supprimé"));
        }
        setTimeout(() => {
          fs.unlink(outputPath, () => console.log("🧹 Fichier .mp4 supprimé (auto-clean)"));
        }, 30000);
      });
    });
  });
  

module.exports = router;
