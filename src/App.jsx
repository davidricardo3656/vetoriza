import React, { useEffect, useRef, useState } from "react";

// Vectorizador — React single-file app
// Usa ImageTracer (cliente) via CDN para vetorizar imagens bitmap em SVG.
// Permite upload, ajustes rápidos e download do SVG resultante.

export default function VectorizadorApp() {
  const [loaded, setLoaded] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [svgText, setSvgText] = useState("");
  const [options, setOptions] = useState({
    ltres: 1,
    qtres: 1,
    pathomit: 8,
    scale: 1,
    strokewidth: 1,
    rightangleenhance: 0,
    colors: 16,
    blurradius: 0,
    numberofcolors: 16,
    despeckle: 1,
    filltype: 1,
    tolerance: 0.2,
  });

  const inputRef = useRef(null);

  useEffect(() => {
    if (window.ImageTracer) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/imagetracerjs@1.2.3/imagetracer_v1.2.3.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => {
      console.error("Falha ao carregar ImageTracer.");
      setLoaded(false);
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageURL(url);
    setSvgText("");
  }

  function handleVectorize() {
    if (!window.ImageTracer) {
      alert("ImageTracer ainda não carregado — verifique sua conexão.");
      return;
    }
    if (!imageURL) {
      alert("Envie uma imagem primeiro.");
      return;
    }

    const opts = {
      ltres: Number(options.ltres),
      qtres: Number(options.qtres),
      pathomit: Number(options.pathomit),
      scale: Number(options.scale),
      strokewidth: Number(options.strokewidth),
      rightangleenhance: Number(options.rightangleenhance),
      blurradius: Number(options.blurradius),
      numberofcolors: Number(options.numberofcolors),
      despeckle: Number(options.despeckle),
      filltype: Number(options.filltype),
      tolerance: Number(options.tolerance),
    };

    ImageTracer.imageToSVG(imageURL, function (svg) {
      setSvgText(svg);
    }, opts);
  }

  function downloadSVG() {
    if (!svgText) return;
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vectorizado.svg";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setImageURL(null);
    setSvgText("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-3">Vectorizador — protótipo</h1>
        <p className="text-sm text-neutral-600 mb-4">
          Este protótipo usa <span className="font-medium">ImageTracer.js</span> no cliente para
          converter bitmaps em SVG. Ajuste os parâmetros e clique em <span className="font-semibold">Vetorizar</span>.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs text-neutral-700 mb-2">Enviar imagem</label>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="block w-full text-sm"
            />

            <div className="mt-4 text-sm">
              <label className="font-medium">Pré‑visualização</label>
              <div className="mt-2 border rounded p-2 bg-neutral-100 h-48 flex items-center justify-center overflow-hidden">
                {imageURL ? (
                  <img src={imageURL} alt="preview" className="max-h-full max-w-full" />
                ) : (
                  <span className="text-neutral-500">Nenhuma imagem</span>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleVectorize}
                className="px-3 py-2 rounded-lg bg-emerald-500 text-white font-medium disabled:opacity-60"
                disabled={!loaded || !imageURL}
              >
                Vetorizar
              </button>
              <button
                onClick={downloadSVG}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white font-medium"
                disabled={!svgText}
              >
                Baixar SVG
              </button>
              <button
                onClick={reset}
                className="px-3 py-2 rounded-lg border"
              >
                Limpar
              </button>
            </div>

            <div className="mt-4 text-xs text-neutral-500">
              {loaded ? (
                <span>ImageTracer carregado — pronto.</span>
              ) : (
                <span>Carregando biblioteca...</span>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Parâmetros</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs">Número de cores ({options.numberofcolors})</label>
                <input
                  type="range"
                  min="2"
                  max="64"
                  value={options.numberofcolors}
                  onChange={(e) => setOptions({ ...options, numberofcolors: e.target.value })}
                />

                <label className="text-xs">Simplificação pathomit ({options.pathomit})</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={options.pathomit}
                  onChange={(e) => setOptions({ ...options, pathomit: e.target.value })}
                />

                <label className="text-xs">Blur radius ({options.blurradius})</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={options.blurradius}
                  onChange={(e) => setOptions({ ...options, blurradius: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs">Scale ({options.scale})</label>
                <input
                  type="range"
                  min="0.25"
                  max="4"
                  step="0.25"
                  value={options.scale}
                  onChange={(e) => setOptions({ ...options, scale: e.target.value })}
                />

                <label className="text-xs">Despeckle ({options.despeckle})</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={options.despeckle}
                  onChange={(e) => setOptions({ ...options, despeckle: e.target.value })}
                />

                <label className="text-xs">Tolerância ({options.tolerance})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={options.tolerance}
                  onChange={(e) => setOptions({ ...options, tolerance: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">SVG resultante</label>

              <div className="border rounded p-3 bg-neutral-50 min-h-[280px] overflow-auto">
                {svgText ? (
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div dangerouslySetInnerHTML={{ __html: svgText }} />
                    </div>
                    <div className="w-full md:w-80">
                      <div className="text-xs font-mono break-words text-neutral-700 text-sm">
                        <pre className="text-xs">{svgText}</pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-neutral-500">SVG vazio — gere um vetor para pré‑visualizar aqui.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-neutral-500">Observações: nenhum algoritmo dá "perfeição" absoluta — ajuste parâmetros para resultados desejados. Para maior fidelidade em imagens complexas, uma solução servidor com Potrace/GIMP/AutoTrace e pré‑processamento tende a produzir melhores resultados.</div>
      </div>

      <footer className="mt-6 text-sm text-neutral-500">Protótipo — entregue como exemplo técnico.</footer>
    </div>
  );
}
