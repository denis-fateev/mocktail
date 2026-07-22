import { build as esbuild } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as viteBuild } from 'vite';
import viteConfig from '../vite.config.mjs';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const distDir = resolve(projectRoot, 'dist');

const esbuildAlias = {
  '@shared': resolve(projectRoot, 'src/shared'),
};

const scriptEntries = [
  ['background', resolve(projectRoot, 'src/extension/background/background.ts')],
];

await viteBuild(viteConfig);
await mkdir(distDir, { recursive: true });

for (const [name, entryPoint] of scriptEntries) {
  await esbuild({
    entryPoints: [entryPoint],
    outfile: resolve(distDir, `${name}.js`),
    bundle: true,
    format: 'iife',
    target: 'chrome114',
    platform: 'browser',
    sourcemap: false,
    legalComments: 'none',
    alias: esbuildAlias,
  });
}
