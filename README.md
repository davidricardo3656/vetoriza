# vectorizador-react

Protótipo Vite + React + Tailwind que vetoriza imagens no cliente usando ImageTracer.js.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` (ou o endereço que o Vite mostrar).

## Deploy na Vercel

1. Suba este repositório no GitHub.
2. Conecte no Vercel (New Project) e selecione o repositório.
3. O Vercel detecta Vite automaticamente e faz o deploy.

## Observações

- A app carrega ImageTracer.js via CDN diretamente no navegador.
- Para maior fidelidade em vetorização profissional, crie backend com Potrace + ImageMagick/Sharp.
