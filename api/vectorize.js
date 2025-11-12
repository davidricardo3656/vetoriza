import { trace } from "potrace";
import sharp from "sharp";
import fs from "fs";
import multer from "multer";
import express from "express";

const app = express();
const upload = multer({ dest: "/tmp" });

app.post("/api/vectorize", upload.single("image"), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const buffer = await sharp(inputPath)
      .resize(1000) // aumenta resolução pra suavizar contornos
      .threshold(180) // cria contraste perfeito entre verde e branco
      .toBuffer();

    trace(buffer, {
      turdSize: 0,
      optTolerance: 0.2,
      threshold: 180,
      color: "#00843D", // verde da Intelbras
      background: "#FFFFFF",
    }, (err, svg) => {
      fs.unlinkSync(inputPath);
      if (err) return res.status(500).json({ error: "Falha na vetorização" });
      res.setHeader("Content-Type", "image/svg+xml");
      res.send(svg);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default app;
