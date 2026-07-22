import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'promo-slides.html');
const outDir = path.join(__dirname, 'png');

const slides = [
  'slide-01-hero',
  'slide-02-response',
  'slide-03-requests',
  'slide-04-headers',
  'slide-05-privacy',
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});

await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });

for (const id of slides) {
  const el = page.locator(`#${id}`);
  await el.scrollIntoViewIfNeeded();
  const outPath = path.join(outDir, `${id}.png`);
  await el.screenshot({ path: outPath, type: 'png' });
  console.log(`Wrote ${outPath}`);
}

await browser.close();
