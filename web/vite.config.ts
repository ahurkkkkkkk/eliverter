import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

// The Go server serves the built output from its own embedded filesystem, so
// relative asset paths keep the same artifact working at "/" on device and at
// any base URL during development.
export default defineConfig({
  base: './',
  plugins: [tailwindcss(), svelte()],
  build: {
    outDir: '../go/internal/webui/dist',
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8420',
      '/ws': { target: 'ws://127.0.0.1:8420', ws: true },
    },
  },
});
