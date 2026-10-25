// Renders public/og.png (1200x630), the image shown when the site is shared on
// LinkedIn. Flat shapes only, drawn from the same tokens as the site (night
// service palette). Run with: node scripts/og-image.mjs
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
body { width: 1200px; height: 630px; background: #000; color: #fff; font-family: Overpass, sans-serif; position: relative; overflow: hidden; }
.name { position: absolute; left: 80px; top: 110px; font-size: 150px; font-weight: 800; letter-spacing: -0.025em; line-height: 1; }
.role { position: absolute; left: 84px; top: 280px; font-size: 56px; font-weight: 600; }
.langs { position: absolute; left: 84px; top: 380px; display: flex; gap: 36px; font-size: 36px; font-weight: 600; }
.lang { display: flex; align-items: center; gap: 14px; }
.disc { width: 52px; height: 52px; border-radius: 50%; background: #fff; color: #000; display: grid; place-items: center; font-weight: 800; font-size: 30px; }
.line { position: absolute; left: 0; width: 1200px; height: 14px; bottom: 76px; display: flex; }
.line div { flex: 1; }
.dots { position: absolute; bottom: 64px; left: 0; width: 1200px; display: flex; justify-content: space-around; padding: 0 140px; }
.dot { width: 38px; height: 38px; border-radius: 50%; background: #000; border: 10px solid; }
</style></head><body>
<div class="name">Emilio Parra</div>
<div class="role">Software Developer</div>
<div class="langs">
  <span class="lang"><span class="disc">J</span>Java</span>
  <span class="lang"><span class="disc">P</span>Python</span>
  <span class="lang"><span class="disc">T</span>TypeScript</span>
</div>
<div class="line">
  <div style="background:#ff6252"></div><div style="background:#6aa3ff"></div>
  <div style="background:#ffb41f"></div><div style="background:#d49a6a"></div>
</div>
<div class="dots">
  <span class="dot" style="border-color:#ff6252"></span><span class="dot" style="border-color:#6aa3ff"></span>
  <span class="dot" style="border-color:#ffb41f"></span><span class="dot" style="border-color:#d49a6a"></span>
</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png' });
await browser.close();
console.log('wrote public/og.png');
