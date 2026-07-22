import { context as esbuildContext } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const distDir = resolve(projectRoot, 'dist');
const viteBin = resolve(projectRoot, 'node_modules/vite/bin/vite.js');

const esbuildAlias = {
  '@shared': resolve(projectRoot, 'src/shared'),
};

const scriptEntries = [
  ['background', resolve(projectRoot, 'src/extension/background/background.ts')],
];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const contexts = await Promise.all(
  scriptEntries.map(([name, entryPoint]) =>
    esbuildContext({
      entryPoints: [entryPoint],
      outfile: resolve(distDir, `${name}.js`),
      bundle: true,
      format: 'iife',
      target: 'chrome114',
      platform: 'browser',
      sourcemap: true,
      legalComments: 'none',
      alias: esbuildAlias,
    }),
  ),
);

await Promise.all(contexts.map((ctx) => ctx.watch()));

const viteProcess = spawn(
  process.execPath,
  [viteBin, 'build', '--watch'],
  {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      MOCKTAIL_WATCH: '1',
    },
  },
);

const shutdown = async () => {
  viteProcess.kill('SIGINT');
  await Promise.all(contexts.map((ctx) => ctx.dispose()));
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
