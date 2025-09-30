import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@state': path.resolve(__dirname, 'src/state'),
      '@styles': path.resolve(__dirname, 'src/styles')
    }
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true
  }
});
