import sharp from "sharp";
import { trace } from "potrace";
import express from "express";
import multer from "multer";
import fs from "fs";

const app = express();
const upload = multer({ dest: "/tmp" });

app.post("/api/vectorize", upload.single("image"), async (req, res) => {
  try {
    const inputPath = req.file.path;

    // Reduz as cores (quantização)
    const { data, info } = await sharp(inputPath)
      .resize(1000)
      .toColorspace("srgb")
      .quantize({ maxColors: 4 }) // reduz paleta a poucas cores
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Extrai cores dominantes
    const pixels = [];
    for (let i = 0; i < data.length; i += 3) {
      pixels.push(`#${data[i].toString(16)}${data[i + 1].toString(16)}${data[i + 2].toString(16)}`);
    }
    const uniqueColors = [...new Set(pixels)].slice(0, 4); // até 4 cores principais

    let combinedSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${info.width}" height="${info.height}">`;

    // Gera uma camada para cada cor
    for (const color of uniqueColors) {
      const maskBuffer = await sharp(inputPath)
        .resize(1000)
        .toBuffer();

      const svgLayer = await new Promise((resolve, reject) => {
        trace(maskBuffer, { color, background: "transparent", threshold: 180 }, (err, svg) => {
          if (err) reject(err);
          else resolve(svg);
        });
      });

      combinedSVG += svgLayer.replace(/<\/?svg[^>]*>/g, ""); // remove tags duplicadas
    }

    combinedSVG += "</svg>";
    fs.unlinkSync(inputPath);
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(combinedSVG);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao vetorizar com múltiplas cores" });
  }
});

export default app;
