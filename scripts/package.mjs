import { spawn } from 'node:child_process';
import { mkdir, readFile, rm, stat } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const distDir = resolve(projectRoot, 'dist');
const releaseDir = resolve(projectRoot, 'release');

const packageJson = JSON.parse(await readFile(resolve(projectRoot, 'package.json'), 'utf8'));
const version = packageJson.version ?? '0.0.0';
const zipPath = resolve(releaseDir, `mocktail-${version}.zip`);

function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? projectRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

await run(process.execPath, [resolve(currentDir, 'build.mjs')]);

const distStat = await stat(distDir).catch(() => null);
if (!distStat?.isDirectory()) {
  throw new Error('dist/ was not created by the build');
}

await mkdir(releaseDir, { recursive: true });
await rm(zipPath, { force: true });

await run(
  'zip',
  ['-r', '-X', zipPath, '.', '-x', '*.map', '-x', '**/*.map', '-x', '.DS_Store', '-x', '**/.DS_Store'],
  { cwd: distDir },
);

console.log(`Created ${relative(projectRoot, zipPath)}`);
