import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const rootDir = path.resolve(__dirname, 'renderer');

export default defineConfig({
  root: rootDir,
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  publicDir: path.resolve(__dirname, 'assets'),
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@renderer': rootDir,
      '@components': path.resolve(rootDir, 'components'),
      '@views': path.resolve(rootDir, 'views'),
      '@context': path.resolve(rootDir, 'context'),
      '@hooks': path.resolve(rootDir, 'hooks'),
      '@services': path.resolve(rootDir, 'services'),
      '@theme': path.resolve(rootDir, 'theme'),
      '@shared': path.resolve(__dirname, 'shared')
    }
  }
});
