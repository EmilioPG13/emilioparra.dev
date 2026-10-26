// Renders public/og.png (1200x630), the image shown when the site is shared on
// LinkedIn. Flat type on the page ground, from the same tokens as the site
// (light theme). Run with: node scripts/og-image.mjs
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Inlined as a data URL: a page set with setContent cannot load file:// fonts.
const font = `data:font/woff2;base64,${readFileSync(
  resolve('node_modules/@fontsource-variable/overpass/files/overpass-latin-wght-normal.woff2'),
).toString('base64')}`;

const html = `<!doctype html><html><head><style>
@font-face { font-family: Overpass; src: url("${font}") format("woff2"); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #f4f4f1; color: #111214; font-family: Overpass, sans-serif; position: relative; overflow: hidden; }
.rule { position: absolute; left: 80px; top: 80px; width: 1040px; height: 6px; background: #111214; }
.name { position: absolute; left: 76px; top: 130px; font-size: 168px; font-weight: 800; letter-spacing: -0.025em; line-height: 1; }
.role { position: absolute; left: 82px; top: 330px; font-size: 56px; font-weight: 600; color: #4a4c52; }
.langs { position: absolute; left: 82px; top: 430px; font-size: 40px; font-weight: 700; display: flex; gap: 40px; }
.url { position: absolute; left: 82px; bottom: 64px; font-size: 32px; font-weight: 600; color: #4a4c52; }
</style></head><body>
<div class="rule"></div>
<div class="name">Emilio Parra</div>
<div class="role">Software Developer</div>
<div class="langs"><span>Java</span><span>Python</span><span>TypeScript</span></div>
<div class="url">emilioparra.dev</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png' });
await browser.close();
console.log('wrote public/og.png');
