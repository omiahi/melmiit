import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(root, './src') },
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    rollupOptions: {
      input: {
        main: path.resolve(root, 'index.html'),
        admin: path.resolve(root, 'admin/index.html'),
      },
    },
  },
  server: { port: 3000, open: true },
});
