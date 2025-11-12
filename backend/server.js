import express from "express";
import multer from "multer";
import sharp from "sharp";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors()); // permitir que o frontend chame a API

const upload = multer({ dest: "/tmp" });

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
      if (err) return reject({ err, stderr });
      resolve({ stdout, stderr });
    });
  });
}

app.post("/api/vectorize", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Envie um arquivo no campo 'image'." });

  const inputPath = req.file.path;
  const base = `/tmp/vectorizer-${Date.now()}`;
  const pngPath = `${base}.png`;
  const pnmPath = `${base}.pnm`;
  const svgPath = `${base}.svg`;

  try {
    // 1) Preprocess: resize (opcional), limpar ruído, aumentar contraste
    // Ajuste resize conforme necessário (ex: 2000 para máxima fidelidade)
    await sharp(inputPath)
      .resize({ width: 2000, withoutEnlargement: true })
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // remove transparência
      .sharpen()
      .toFile(pngPath);

    // 2) Converter PNG para PNM (ImageMagick 'convert' produz PNM)
    // Usamos -threshold para criar bom contraste caso queira bitmap
    // Para logos coloridos vamos só converter sem threshold
    await run(`convert "${pngPath}" "${pnmPath}"`);

    // 3) Rodar Potrace (gera SVG a partir do PNM)
    // -s = output SVG, --turdsize 0 para preservar pequenos detalhes,
    // --optimizecurve para curvas mais suaves
    await run(`potrace "${pnmPath}" -s -o "${svgPath}" --turdsize 0 --opttolerance 0.2`);

    // 4) Ler SVG e devolver
    const svg = await fs.readFile(svgPath, "utf8");

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (e) {
    console.error("Erro no pipeline:", e);
    res.status(500).json({ error: "Falha ao vetorizar a imagem", details: e?.stderr ?? e });
  } finally {
    // cleanup (tentar remover arquivos temporários)
    for (const p of [inputPath, pngPath, pnmPath, svgPath]) {
      try { await fs.unlink(p); } catch (err) { /* ignora */ }
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Vectorizer backend rodando em http://localhost:${port}`);
});
