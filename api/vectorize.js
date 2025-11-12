import express from "express";
import multer from "multer";
import sharp from "sharp";
import { trace } from "potrace";
import fs from "fs";

const app = express();
const upload = multer({ dest: "/tmp" });

app.post("/api/vectorize", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const buffer = await sharp(imagePath)
      .grayscale()
      .toBuffer();

    trace(buffer, { threshold: 180 }, (err, svg) => {
      if (err) {
        res.status(500).json({ error: "Erro na vetorização." });
      } else {
        res.setHeader("Content-Type", "image/svg+xml");
        res.send(svg);
      }
      fs.unlinkSync(imagePath);
    });
  } catch (err) {
    res.status(500).json({ error: "Erro interno." });
  }
});

export default app;
