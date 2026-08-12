import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

// O site publicado vive em https://apsis-consultoria.github.io/Fifa/, ou seja, numa
// subpasta - por isso o build sai com base `/Fifa/`. Em desenvolvimento a base
// continua `/`, senao o `npm run dev` passaria a responder em /Fifa/ sem motivo.
//
// A saida vai para `docs/` porque e de la que o GitHub Pages publica
// (Settings > Pages > Deploy from a branch > main, pasta /docs). Sendo a pasta
// servida, ela E versionada: rodar `npm run build` e subir o resultado e o que
// atualiza o site.
// O criterio e `mode`, nao `command`: para o Vite, `vite preview` tambem e um
// "serve", entao com `command` o preview subiria na raiz e nao reproduziria o site
// publicado. Por `mode`, build e preview ficam em producao (base `/Fifa/`) e so o
// `npm run dev` fica em `/`.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Fifa/' : '/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  server: {
    allowedHosts: true,
  },
}));
