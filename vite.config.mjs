import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const currentDir = dirname(fileURLToPath(import.meta.url));
const isWatchMode = process.env.MOCKTAIL_WATCH === '1';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: !isWatchMode,
    rollupOptions: {
      input: {
        sidepanel: resolve(currentDir, 'sidepanel.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
