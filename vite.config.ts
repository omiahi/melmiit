import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 👇 Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),

      // Figma-generated aliases (safe to keep)
      'vaul@1.1.2': 'vaul',
      'sonner@2.0.3': 'sonner',
      'recharts@2.15.2': 'recharts',
      'react-resizable-panels@2.1.7': 'react-resizable-panels',
      'react-hook-form@7.55.0': 'react-hook-form',
      'react-day-picker@8.10.1': 'react-day-picker',
      'next-themes@0.4.6': 'next-themes',
      'lucide-react@0.487.0': 'lucide-react',
      'input-otp@1.4.2': 'input-otp',
      'embla-carousel-react@8.6.0': 'embla-carousel-react',
      'cmdk@1.1.1': 'cmdk',

      'figma:asset/7af99ccca81e67ea546fd3afd91ac4248a65ee2b.png':
        path.resolve(__dirname, './src/assets/7af99ccca81e67ea546fd3afd91ac4248a65ee2b.png'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist', // ✅ or 'build' — pick ONE and match Vercel
  },
  server: {
    port: 3000,
    open: true,
  },
});
